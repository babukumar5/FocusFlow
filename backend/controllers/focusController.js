const FocusSession = require('../models/FocusSession');
const User = require('../models/User');

// Create focus session (POST /api/focus/session)
exports.createFocusSession = async (req, res) => {
  const { duration, actualCompletedMinutes, startTime, endTime, date, mode, interrupted, task } = req.body;

  try {
    const focusSession = new FocusSession({
      user: req.user._id,
      duration,
      actualCompletedMinutes,
      startTime: startTime || new Date(),
      endTime: endTime || new Date(),
      date: date || new Date(),
      mode: mode || 'focus',
      interrupted: interrupted !== undefined ? interrupted : false,
      task: task || null
    });

    const createdSession = await focusSession.save();

    // Update user streaks if a focus session is completed successfully
    if (mode === 'focus' && !interrupted && actualCompletedMinutes > 0) {
      const user = await User.findById(req.user._id);
      if (user) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (!user.streak) {
          user.streak = { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
        }

        if (!user.streak.lastActiveDate) {
          user.streak.currentStreak = 1;
          user.streak.longestStreak = 1;
          user.streak.lastActiveDate = today;
        } else {
          const lastActiveStr = new Date(user.streak.lastActiveDate).toISOString().split('T')[0];

          if (lastActiveStr === todayStr) {
            // Streak already logged/maintained today
            user.streak.lastActiveDate = today;
          } else {
            const lastActiveDate = new Date(user.streak.lastActiveDate);
            const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const d2 = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
            const diffTime = Math.abs(d1 - d2);
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              // Consecutive day
              user.streak.currentStreak += 1;
              if (user.streak.currentStreak > user.streak.longestStreak) {
                user.streak.longestStreak = user.streak.currentStreak;
              }
            } else {
              // Streak broken and restarted
              user.streak.currentStreak = 1;
            }
            user.streak.lastActiveDate = today;
          }
        }
        await user.save();
      }
    }

    res.status(201).json(createdSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve focus session history list (GET /api/focus/history)
exports.getFocusHistory = async (req, res) => {
  try {
    const sessions = await FocusSession.find({ user: req.user._id })
      .populate('task', 'title category')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a session log (DELETE /api/focus/session/:id)
exports.deleteFocusSession = async (req, res) => {
  try {
    const session = await FocusSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await session.deleteOne();
    res.json({ message: 'Session removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get focus session statistics (GET /api/focus/stats)
exports.getFocusStats = async (req, res) => {
  try {
    const sessions = await FocusSession.find({ user: req.user._id }).populate('task', 'category');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(todayStart);
    startOfWeek.setDate(todayStart.getDate() - todayStart.getDay()); // Sunday start
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let focusedToday = 0;
    let focusedThisWeek = 0;
    let focusedThisMonth = 0;
    let focusedThisYear = 0;
    let totalLifetimeFocus = 0;
    let completedSessions = 0;
    let longestSession = 0;

    // Charts grouping datasets
    const dailyData = {};
    const weeklyData = {};
    const monthlyData = {};
    const categoryDistribution = {};
    const heatmap = {}; // Group by weekday and hour of day

    // Initialize dailyData for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(todayStart.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyData[key] = { name: key, focusTime: 0 };
    }

    sessions.forEach(session => {
      // Only aggregate focus mode sessions that are completed or partially completed
      if (session.mode === 'focus') {
        const sessionDate = new Date(session.date || session.createdAt);
        const mins = session.actualCompletedMinutes || 0;

        totalLifetimeFocus += mins;
        if (!session.interrupted) {
          completedSessions += 1;
          if (mins > longestSession) {
            longestSession = mins;
          }
        }

        if (sessionDate >= todayStart) {
          focusedToday += mins;
        }
        if (sessionDate >= startOfWeek) {
          focusedThisWeek += mins;
        }
        if (sessionDate >= startOfMonth) {
          focusedThisMonth += mins;
        }
        if (sessionDate >= startOfYear) {
          focusedThisYear += mins;
        }

        // Daily Grouping (Last 7 Days)
        const dayKey = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (dailyData[dayKey] && sessionDate >= new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000)) {
          dailyData[dayKey].focusTime += mins;
        }

        // Monthly Grouping (Last 6 Months)
        const monthKey = sessionDate.toLocaleDateString('en-US', { month: 'short' });
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        if (sessionDate >= sixMonthsAgo) {
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { name: monthKey, focusTime: 0, sortKey: sessionDate.getMonth() };
          }
          monthlyData[monthKey].focusTime += mins;
        }

        // Category Distribution
        const cat = (session.task && session.task.category) || 'General';
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + mins;

        // Heatmap: Day of week (0-6) and hour (0-23)
        const dayIndex = sessionDate.getDay(); // 0 = Sunday, etc.
        const hourIndex = new Date(session.startTime).getHours();
        const heatmapKey = `${dayIndex}-${hourIndex}`;
        heatmap[heatmapKey] = (heatmap[heatmapKey] || 0) + mins;
      }
    });

    // Format charts datasets
    const chartDaily = Object.values(dailyData);
    
    const chartWeekly = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(todayStart);
      start.setDate(todayStart.getDate() - (i * 7) - todayStart.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      let sum = 0;
      sessions.forEach(s => {
        if (s.mode === 'focus') {
          const sDate = new Date(s.date || s.createdAt);
          if (sDate >= start && sDate <= end) {
            sum += s.actualCompletedMinutes || 0;
          }
        }
      });
      chartWeekly.push({ name: `Wk -${i}`, focusTime: sum });
    }

    const chartMonthly = Object.values(monthlyData)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(m => ({ name: m.name, focusTime: m.focusTime }));

    const categoryData = Object.keys(categoryDistribution).map(name => ({
      name,
      value: categoryDistribution[name]
    }));

    const heatmapData = Object.keys(heatmap).map(key => {
      const [day, hour] = key.split('-').map(Number);
      return { day, hour, value: heatmap[key] };
    });

    const averageSessionLength = completedSessions > 0 ? Math.round(totalLifetimeFocus / completedSessions) : 0;

    res.json({
      focusedToday,
      focusedThisWeek,
      focusedThisMonth,
      focusedThisYear,
      totalLifetimeFocus,
      completedSessions,
      averageSessionLength,
      longestSession,
      charts: {
        daily: chartDaily,
        weekly: chartWeekly,
        monthly: chartMonthly,
        category: categoryData,
        heatmap: heatmapData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
