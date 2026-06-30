const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['focus-time', 'tasks-completed'],
    required: true,
  },
  targetValue: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  dueDate: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
