const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  category: {
    type: String,
    default: 'General',
  },
  tags: {
    type: [String],
    default: []
  },
  order: {
    type: Number,
    default: 0
  },
  subtasks: [{
    title: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  dueDate: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
