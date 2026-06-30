const Habit = require('../models/Habit');

// Calculate streak based on completion history dates
const calculateStreak = (history) => {
  if (!history || history.length === 0) return 0;
  
  // Normalize dates to YYYY-MM-DD strings and remove duplicates
  const dateStrings = Array.from(
    new Set(
      history.map(d => {
        const dateObj = new Date(d);
        // adjust for timezone offset to get local YYYY-MM-DD
        const offset = dateObj.getTimezoneOffset();
        const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
      })
    )
  ).sort().reverse();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // If the latest completion wasn't today or yesterday, the streak is 0
  if (dateStrings[0] !== todayStr && dateStrings[0] !== yesterdayStr) {
    return 0;
  }
  
  let streak = 1;
  for (let i = 0; i < dateStrings.length - 1; i++) {
    const current = new Date(dateStrings[i]);
    const next = new Date(dateStrings[i+1]);
    const diffTime = Math.abs(current - next);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break; // gap detected
    }
  }
  
  return streak;
};

// Fetch habits
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id });
    
    // Recalculate streaks before returning to ensure validity
    const updatedHabits = await Promise.all(habits.map(async (habit) => {
      const currentStreak = calculateStreak(habit.history);
      if (currentStreak !== habit.streak) {
        habit.streak = currentStreak;
        if (currentStreak > habit.longestStreak) {
          habit.longestStreak = currentStreak;
        }
        await habit.save();
      }
      return habit;
    }));
    
    res.json(updatedHabits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new habit
exports.createHabit = async (req, res) => {
  const { title } = req.body;

  try {
    const habit = new Habit({
      user: req.user._id,
      title
    });

    const createdHabit = await habit.save();
    res.status(201).json(createdHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle habit completion for today
exports.toggleHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if completed today
    const completedTodayIndex = habit.history.findIndex(
      d => new Date(d) >= todayStart && new Date(d) <= todayEnd
    );

    if (completedTodayIndex > -1) {
      // Already completed today, so remove it (toggle off)
      habit.history.splice(completedTodayIndex, 1);
    } else {
      // Add completion for today (toggle on)
      habit.history.push(new Date());
    }

    // Recalculate streaks
    habit.streak = calculateStreak(habit.history);
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete habit
exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await habit.deleteOne();
    res.json({ message: 'Habit removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
