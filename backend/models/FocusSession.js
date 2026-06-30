const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  duration: {
    type: Number, // planned duration in minutes
    required: true,
  },
  actualCompletedMinutes: {
    type: Number, // actual completed focus minutes
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  mode: {
    type: String,
    enum: ['focus', 'short break', 'long break'],
    required: true,
  },
  interrupted: {
    type: Boolean,
    default: false,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
