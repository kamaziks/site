const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ім'я обов'язкове"],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email обов\'язковий'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Введіть дійсний email']
  },
  password: {
    type: String,
    required: [true, 'Пароль обов\'язковий'],
    minlength: [6, 'Пароль має містити мінімум 6 символів'],
    select: false // Щоб не повертати пароль у відповідях API
  },
  level: {
    type: String,
    enum: ['standard', 'premium', 'admin'],
    default: 'standard'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
});

// Хешування паролю перед збереженням
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Метод для порівняння введеного паролю з хешованим
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


UserSchema.methods.isLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', UserSchema);