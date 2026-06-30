const Goal = require('../models/Goal');

// Fetch user goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new goal
exports.createGoal = async (req, res) => {
  const { title, type, targetValue, dueDate } = req.body;

  try {
    const goal = new Goal({
      user: req.user._id,
      title,
      type,
      targetValue,
      dueDate: dueDate || null
    });

    const createdGoal = await goal.save();
    res.status(201).json(createdGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update goal progress manually or automatically
exports.updateGoalProgress = async (req, res) => {
  const { currentValue } = req.body;

  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (currentValue !== undefined) {
      goal.currentValue = currentValue;
    }

    // Auto mark as completed if target achieved
    if (goal.currentValue >= goal.targetValue) {
      goal.status = 'completed';
    } else {
      goal.status = 'active';
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
