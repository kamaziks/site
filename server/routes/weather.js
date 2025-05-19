const express = require('express');
const WeatherSearch = require('../models/WeatherSearch');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/weather/log-search
// @desc    Логування пошуку погоди
// @access  Private
router.post('/log-search', protect, async (req, res) => {
    try {
        const { city } = req.body;
        await WeatherSearch.create({
            city,
            user: req.user._id,
            timestamp: new Date()
        });
        res.json({ success: true });
    } catch (e) {
        res.json({ success: false, message: 'Помилка логування пошуку' });
    }
});

// @route   GET /api/weather/searches
// @desc    Отримання історії пошуків (для адміна - всі пошуки, для користувача - свої)
// @access  Private
router.get('/searches', protect, async (req, res) => {
  try {
    let searches;
    
    // Якщо адмін - повертаємо всі пошуки
    if (req.user.level === 'admin') {
      searches = await WeatherSearch.find()
        .populate('user', 'name email')
        .sort('-timestamp');
    } else {
      // Якщо звичайний користувач - повертаємо тільки його пошуки
      searches = await WeatherSearch.find({ user: req.user.id })
        .sort('-timestamp');
    }

    res.status(200).json({
      success: true,
      count: searches.length,
      searches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
});

// @route   GET /api/weather/stats
// @desc    Отримання статистики пошуків погоди
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Загальна кількість пошуків
    const totalSearches = await WeatherSearch.countDocuments();
    
    // Найпопулярніші міста (топ 5)
    const popularCities = await WeatherSearch.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Кількість пошуків за останній тиждень
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklySearches = await WeatherSearch.countDocuments({
      timestamp: { $gte: oneWeekAgo }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalSearches,
        weeklySearches,
        popularCities
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