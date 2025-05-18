const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Завантаження змінних середовища
dotenv.config();

// Підключення до бази даних
connectDB();

// Ініціалізація Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Маршрути
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));

// Базовий маршрут
app.get('/', (req, res) => {
  res.send('API працює');
});

// Обробник помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Помилка сервера'
  });
});

// Порт сервера
const PORT = process.env.PORT || 5000;

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер працює на порті ${PORT}`);
});