import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PomodoroTimer from '../components/PomodoroTimer';
import TaskList from '../components/TaskList';
import ProductivityStats from '../components/ProductivityStats';
import { Settings, User as UserIcon } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Hello, {user?.name || 'User'}</h1>
          <p className="subtitle">Ready for a productive session?</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn glass-panel" aria-label="Profile">
            <UserIcon size={20} />
          </button>
          <button className="icon-btn glass-panel" aria-label="Settings">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="timer-section">
          <PomodoroTimer />
        </section>

        <section className="tasks-section glass-panel">
          <div className="section-header">
            <h2>Today's Tasks</h2>
          </div>
          
          <TaskList />
        </section>
        
        <section className="stats-section glass-panel">
           <div className="section-header">
            <h2>Activity Stats (Focus Minutes)</h2>
          </div>
          <ProductivityStats />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
