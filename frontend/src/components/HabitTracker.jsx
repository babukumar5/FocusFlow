import React, { useContext, useState } from 'react';
import { HabitContext } from '../context/HabitContext';
import { Award, Flame, CheckCircle, Circle, Plus, Trash2 } from 'lucide-react';
import './HabitTracker.css';

const HabitTracker = () => {
  const { habits, addHabit, toggleHabit, deleteHabit, loading } = useContext(HabitContext);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    addHabit({ title: newHabitTitle.trim() });
    setNewHabitTitle('');
    setShowAddForm(false);
  };

  const isCompletedToday = (history) => {
    if (!history || history.length === 0) return false;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return history.some(d => new Date(d) >= todayStart && new Date(d) <= todayEnd);
  };

  const getCompletedCountToday = () => {
    return habits.filter(h => isCompletedToday(h.history)).length;
  };

  const getCompletionPercentage = () => {
    if (habits.length === 0) return 0;
    return Math.round((getCompletedCountToday() / habits.length) * 100);
  };

  if (loading) {
    return (
      <div className="habit-skeleton animate-pulse">
        <div className="skeleton-bar"></div>
        <div className="skeleton-bar"></div>
      </div>
    );
  }

  return (
    <div className="habit-tracker-container">
      {/* Progress Card */}
      <div className="habit-progress-card glass-panel">
        <div className="progress-details">
          <div>
            <h3>Today's Habits</h3>
            <p className="subtitle">
              {habits.length === 0 
                ? 'No habits tracked. Add one below!' 
                : `${getCompletedCountToday()} of ${habits.length} completed`}
            </p>
          </div>
          <div className="percentage-display">{getCompletionPercentage()}%</div>
        </div>
        <div className="progress-track-bar">
          <div className="progress-fill-bar" style={{ width: `${getCompletionPercentage()}%` }}></div>
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="habits-list-header">
        <h4>Tracked Habits</h4>
        <button className="icon-btn-small glass-panel" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="add-habit-inline-form glass-panel animate-fade-in">
          <input
            type="text"
            placeholder="e.g. Read 15 mins, Drink water"
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="form-buttons">
            <button type="submit" className="btn-primary btn-small">Add</button>
            <button type="button" className="btn-glass btn-small" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Habits List */}
      <div className="habits-list-container">
        {habits.length === 0 ? (
          <p className="empty-state-text">Build consistency. Start by creating a daily habit!</p>
        ) : (
          habits.map((habit) => {
            const completed = isCompletedToday(habit.history);
            return (
              <div key={habit._id} className={`habit-item-card glass-panel ${completed ? 'completed' : ''}`}>
                <button className="habit-checkbox" onClick={() => toggleHabit(habit._id)}>
                  {completed ? (
                    <CheckCircle size={20} className="checked-icon" />
                  ) : (
                    <Circle size={20} className="unchecked-icon" />
                  )}
                </button>

                <div className="habit-info">
                  <span className="habit-title">{habit.title}</span>
                  <div className="habit-stats-row">
                    <span className="habit-stat streak" title="Current streak">
                      <Flame size={12} className="streak-icon" />
                      <span>{habit.streak} day streak</span>
                    </span>
                    <span className="habit-stat record" title="Longest streak">
                      <Award size={12} className="record-icon" />
                      <span>Record: {habit.longestStreak}</span>
                    </span>
                  </div>
                </div>

                <button 
                  className="habit-delete-btn" 
                  onClick={() => deleteHabit(habit._id)}
                  title="Delete Habit"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
