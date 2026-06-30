const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
