const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для захисту маршрутів, що вимагають авторизації
exports.protect = async (req, res, next) => {
  let token;

  // Перевірка наявності токена у заголовку
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Перевірка наявності токена
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Немає доступу, авторизуйтесь'
    });
  }

  try {
    // Верифікація токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Отримання користувача з БД
    req.user = await User.findById(decoded.id);
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Недійсний токен авторизації'
    });
  }
};

// Middleware для перевірки рівня користувача
exports.authorize = (...levels) => {
  return (req, res, next) => {
    if (!levels.includes(req.user.level)) {
      return res.status(403).json({
        success: false,
        message: 'Немає доступу для цього рівня користувача'
      });
    }
    next();
  };
};