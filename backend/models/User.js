const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'avatar1',
  },
  settings: {
    focusTime: { type: Number, default: 25 },
    shortBreakTime: { type: Number, default: 5 },
    longBreakTime: { type: Number, default: 15 },
    theme: { type: String, default: 'dark' },
    soundType: { type: String, default: 'digital_watch' },
    soundVolume: { type: Number, default: 0.8 },
    browserNotifications: { type: Boolean, default: true },
    autoStartBreaks: { type: Boolean, default: false },
    autoStartTimers: { type: Boolean, default: false }
  },
  streak: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
