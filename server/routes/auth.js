const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Генерація JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Реєстрація нового користувача
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Перевірка наявності користувача з таким email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Користувач з таким email вже існує'
      });
    }

    // Створення нового користувача
    user = await User.create({
      name,
      email,
      password
    });

    // Генерація токена і відправлення відповіді
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Авторизація користувача
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Перевірка наявності email і паролю
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Будь ласка, надайте email і пароль'
      });
    }

    // Пошук користувача і включення поля пароля
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Невірні облікові дані'
      });
    }

    // Перевірка блокування
    if (user.isLocked()) {
      const wait = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Акаунт заблоковано. Спробуйте через ${wait} хв.`
      });
    }

    // Перевірка пароля
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      // Якщо 3 і більше невдалих спроб — блокуємо на 5 хвилин
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
        user.failedLoginAttempts = 0; // обнуляємо лічильник після блокування
      }
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Невірні облікові дані'
      });
    }

    // Успішний вхід — обнуляємо лічильник і блокування
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Генерація токена і відправлення відповіді
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
});
// @route   GET /api/auth/me
// @desc    Отримання даних поточного користувача
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Отримання списку всіх користувачів (тільки для адміна)
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
});

// @route   PUT /api/auth/users/:id/level
// @desc    Зміна рівня користувача (тільки для адміна)
// @access  Private/Admin
router.put('/users/:id/level', protect, authorize('admin'), async (req, res) => {
  try {
    const { level } = req.body;

    // Перевірка правильності рівня
    if (!['standard', 'premium', 'admin'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Недійсний рівень користувача'
      });
    }

    // Оновлення рівня користувача
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { level },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Видалення користувача (тільки для адміна)
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    // Заборона видалення себе
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Ви не можете видалити свій обліковий запис'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Користувача успішно видалено'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
});

// @route   PUT /api/auth/upgrade
// @desc    Покращення рівня користувача до преміум
// @access  Private
router.put('/upgrade', protect, async (req, res) => {
  try {
    // Заборона покращення для адміна
    if (req.user.level === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Адміністратор не потребує покращення'
      });
    }

    // Оновлення рівня поточного користувача
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { level: 'premium' },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
});

module.exports = router;