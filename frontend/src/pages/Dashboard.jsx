import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import PomodoroTimer from '../components/PomodoroTimer';
import TaskList from '../components/TaskList';
import ProductivityStats from '../components/ProductivityStats';
import HabitTracker from '../components/HabitTracker';
import GoalTracker from '../components/GoalTracker';
import CalendarView from '../components/CalendarView';
import { Sparkles, Calendar, Target, Flame } from 'lucide-react';
import './Dashboard.css';

const PRESET_AVATARS = {
  avatar1: '🧘',
  avatar2: '🧠',
  avatar3: '🚀',
  avatar4: '🐱',
  avatar5: '🦉',
  avatar6: '🦊',
  avatar7: '⚡',
  avatar8: '🌱',
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeWidgetTab, setActiveWidgetTab] = useState('habits'); // 'habits', 'goals', 'calendar'

  const renderAvatar = () => {
    if (!user || !user.avatar) return '🧘';
    if (user.avatar.startsWith('data:image')) {
      return <img src={user.avatar} alt="Avatar" className="header-avatar-img" />;
    }
    return PRESET_AVATARS[user.avatar] || '🧘';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Welcome Banner */}
      <header className="dashboard-header glass-panel">
        <div className="header-user-profile">
          <div className="header-avatar-circle">
            {renderAvatar()}
          </div>
          <div>
            <h1>{getGreeting()}, {user?.name || 'Achiever'} <Sparkles className="sparkle-icon" size={18} /></h1>
            <p className="subtitle">Let's craft some flow state today.</p>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Timer & Swapped Trackers */}
        <div className="dashboard-col-left">
          <section className="timer-wrapper-card">
            <PomodoroTimer />
          </section>

          {/* Tracker Switcher Widget Card */}
          <section className="trackers-switcher-card glass-panel">
            <div className="switcher-tabs">
              <button 
                className={`switcher-tab ${activeWidgetTab === 'habits' ? 'active' : ''}`}
                onClick={() => setActiveWidgetTab('habits')}
              >
                <Flame size={14} />
                <span>Habits</span>
              </button>
              <button 
                className={`switcher-tab ${activeWidgetTab === 'goals' ? 'active' : ''}`}
                onClick={() => setActiveWidgetTab('goals')}
              >
                <Target size={14} />
                <span>Goals</span>
              </button>
              <button 
                className={`switcher-tab ${activeWidgetTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveWidgetTab('calendar')}
              >
                <Calendar size={14} />
                <span>Calendar</span>
              </button>
            </div>

            <div className="switcher-content">
              {activeWidgetTab === 'habits' && <HabitTracker />}
              {activeWidgetTab === 'goals' && <GoalTracker />}
              {activeWidgetTab === 'calendar' && <CalendarView />}
            </div>
          </section>
        </div>

        {/* Right Column: Stats & Task Kanban */}
        <div className="dashboard-col-right">
          <section className="stats-wrapper-card">
            <ProductivityStats />
          </section>

          <section className="tasks-wrapper-card glass-panel">
            <div className="tasks-section-header">
              <h2>Kanban Taskboard</h2>
              <p>Drag and drop cards to change status</p>
            </div>
            
            <TaskList />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
