import React, { useContext, useState } from 'react';
import { GoalContext } from '../context/GoalContext';
import { Target, Plus, Trash2, Calendar, Award } from 'lucide-react';
import './GoalTracker.css';

const GoalTracker = () => {
  const { goals, addGoal, deleteGoal, updateGoalProgress, loading } = useContext(GoalContext);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('focus-time'); // 'focus-time', 'tasks-completed'
  const [targetValue, setTargetValue] = useState(10);
  const [dueDate, setDueDate] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim() || !targetValue) return;

    addGoal({
      title: title.trim(),
      type,
      targetValue: Number(targetValue),
      dueDate: dueDate ? new Date(dueDate) : null
    });

    setTitle('');
    setTargetValue(type === 'focus-time' ? 10 : 5);
    setDueDate('');
    setShowAddForm(false);
  };

  const getProgressPercentage = (goal) => {
    if (goal.targetValue === 0) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  const handleIncrement = (goal) => {
    if (goal.status === 'completed') return;
    const incrementStep = goal.type === 'focus-time' ? 30 : 1; // 30 mins for focus time, 1 task for task type
    updateGoalProgress(goal._id, goal.currentValue + incrementStep);
  };

  const formatGoalValue = (goal) => {
    if (goal.type === 'focus-time') {
      // value in minutes -> display as hours or hours + minutes
      const hoursCurrent = (goal.currentValue / 60).toFixed(1);
      const hoursTarget = (goal.targetValue / 60).toFixed(1);
      
      // If target value is less than 60, just display as minutes
      if (goal.targetValue < 60) {
        return `${goal.currentValue}m / ${goal.targetValue}m`;
      }
      
      return `${hoursCurrent}h / ${hoursTarget}h`;
    }
    return `${goal.currentValue} / ${goal.targetValue} tasks`;
  };

  if (loading) {
    return (
      <div className="goals-skeleton animate-pulse">
        <div className="skeleton-goal"></div>
        <div className="skeleton-goal"></div>
      </div>
    );
  }

  return (
    <div className="goals-tracker-container">
      <div className="goals-header">
        <h4>Productivity Goals</h4>
        <button className="icon-btn-small glass-panel" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="add-goal-form glass-panel animate-fade-in">
          <div className="form-group-goal">
            <label>Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Master React, Focus 10 hours"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row-goal">
            <div className="form-group-goal">
              <label>Goal Type</label>
              <select value={type} onChange={(e) => {
                setType(e.target.value);
                setTargetValue(e.target.value === 'focus-time' ? 120 : 5); // Default 120 mins focus or 5 tasks
              }}>
                <option value="focus-time">Focus Time (minutes)</option>
                <option value="tasks-completed">Tasks Completed</option>
              </select>
            </div>

            <div className="form-group-goal">
              <label>Target Value</label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-goal">
            <label>Target Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary btn-small">Create</button>
            <button type="button" className="btn-glass btn-small" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="goals-list">
        {goals.length === 0 ? (
          <p className="empty-state-text">No active goals. Set a target to push your limits!</p>
        ) : (
          goals.map((goal) => {
            const percentage = getProgressPercentage(goal);
            const isCompleted = goal.status === 'completed';
            return (
              <div key={goal._id} className={`goal-card glass-panel ${isCompleted ? 'goal-completed' : ''}`}>
                <div className="goal-card-main">
                  <div className="goal-info-side">
                    <div className="goal-title-row">
                      <Target size={16} className="goal-target-icon" />
                      <span className="goal-title">{goal.title}</span>
                      {isCompleted && <Award size={14} className="award-icon" />}
                    </div>
                    
                    <span className="goal-values">{formatGoalValue(goal)}</span>
                  </div>

                  <div className="goal-action-side">
                    {!isCompleted && (
                      <button 
                        type="button" 
                        className="btn-glass increment-progress-btn"
                        onClick={() => handleIncrement(goal)}
                        title={goal.type === 'focus-time' ? 'Add 30 mins' : 'Add 1 task'}
                      >
                        +{goal.type === 'focus-time' ? '30m' : '1'}
                      </button>
                    )}
                    
                    <button 
                      className="goal-delete-btn" 
                      onClick={() => deleteGoal(goal._id)}
                      title="Delete Goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="goal-progress-section">
                  <div className="goal-progress-track">
                    <div 
                      className={`goal-progress-fill ${isCompleted ? 'full' : ''}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="goal-progress-meta">
                    <span>{percentage}% complete</span>
                    {goal.dueDate && (
                      <span className="goal-due">
                        <Calendar size={10} />
                        {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
