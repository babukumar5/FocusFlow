const FocusSession = require('../models/FocusSession');

// Log a completed focus session
exports.logFocusSession = async (req, res) => {
  const { duration, completed, task } = req.body;

  try {
    const focusSession = new FocusSession({
      user: req.user._id,
      duration,
      completed: completed !== undefined ? completed : true,
      task: task || null
    });

    const createdSession = await focusSession.save();
    res.status(201).json(createdSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get focus session statistics (daily, weekly, monthly)
exports.getFocusStats = async (req, res) => {
  try {
    const sessions = await FocusSession.find({ user: req.user._id });

    // Calculate stats in JS
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(todayStart);
    startOfWeek.setDate(todayStart.getDate() - todayStart.getDay()); // Sunday-start
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayMinutes = 0;
    let weekMinutes = 0;
    let monthMinutes = 0;
    let totalMinutes = 0;
    let totalSessions = 0;
    
    // Group focus time by day for charts (last 7 days, last 4 weeks, last 6 months)
    const dailyData = {};
    const weeklyData = {};
    const monthlyData = {};

    // Initialize dailyData for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(todayStart.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyData[key] = { name: key, focusTime: 0, date: d };
    }

    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      totalMinutes += session.duration;
      totalSessions += 1;

      if (sessionDate >= todayStart) {
        todayMinutes += session.duration;
      }
      if (sessionDate >= startOfWeek) {
        weekMinutes += session.duration;
      }
      if (sessionDate >= startOfMonth) {
        monthMinutes += session.duration;
      }

      // Populate daily data (for the last 7 days)
      const dayKey = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyData[dayKey] && sessionDate >= new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000)) {
        dailyData[dayKey].focusTime += session.duration;
      }

      // Populate monthly data (group by month name for the last 6 months)
      const monthKey = sessionDate.toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { name: monthKey, focusTime: 0, sortKey: sessionDate.getMonth() };
      }
      // Only keep if within last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      if (sessionDate >= sixMonthsAgo) {
        monthlyData[monthKey].focusTime += session.duration;
      }
    });

    // Formulate chart responses
    const chartDaily = Object.values(dailyData);
    
    // Generate week-by-week data for the last 4 weeks
    const chartWeekly = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(todayStart);
      start.setDate(todayStart.getDate() - (i * 7) - todayStart.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      let sum = 0;
      sessions.forEach(s => {
        const sDate = new Date(s.createdAt);
        if (sDate >= start && sDate <= end) {
          sum += s.duration;
        }
      });
      
      chartWeekly.push({
        name: `Wk -${i}`,
        focusTime: sum
      });
    }

    const chartMonthly = Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey).map(m => ({
      name: m.name,
      focusTime: m.focusTime
    }));

    res.json({
      todayMinutes,
      weekMinutes,
      monthMinutes,
      totalMinutes,
      totalSessions,
      charts: {
        daily: chartDaily,
        weekly: chartWeekly,
        monthly: chartMonthly
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
