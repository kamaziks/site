const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB підключено: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Помилка: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;