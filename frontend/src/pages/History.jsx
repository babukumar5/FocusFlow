import React, { useState } from 'react';
import useSession from '../hooks/useSession';
import { Calendar, Clock, Award, Trash2, Filter, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './History.css';

const History = () => {
  const { history, loading, deleteSession, exportToCSV } = useSession();
  const [filterType, setFilterType] = useState('all'); // 'today', 'week', 'month', 'year', 'all'

  const filteredHistory = history.filter(session => {
    if (filterType === 'all') return true;

    const sessionDate = new Date(session.date || session.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterType === 'today') {
      return sessionDate >= today;
    }

    if (filterType === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return sessionDate >= startOfWeek;
    }

    if (filterType === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return sessionDate >= startOfMonth;
    }

    if (filterType === 'year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return sessionDate >= startOfYear;
    }

    return true;
  });


  const getActualFocusMinutes = () => {
    return filteredHistory.reduce((sum, s) => sum + (s.actualCompletedMinutes || 0), 0);
  };

  const getCompletionRate = () => {
    if (filteredHistory.length === 0) return 0;
    const completed = filteredHistory.filter(s => !s.interrupted).length;
    return Math.round((completed / filteredHistory.length) * 100);
  };

  const formatDuration = (mins) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  return (
    <div className="history-page-container animate-fade-in">
      <header className="history-header">
        <Link to="/dashboard" className="back-link glass-panel" title="Go to Dashboard">
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </Link>
        <div>
          <h1>Focus Logs & History</h1>
          <p className="subtitle">Review your focus sessions and export data</p>
        </div>
      </header>

      {/* Aggregate metrics header cards */}
      <div className="history-summary-cards">
        <div className="summary-card glass-panel">
          <Clock className="summary-icon accent" size={20} />
          <div className="summary-info">
            <span className="summary-val">{formatDuration(getActualFocusMinutes())}</span>
            <span className="summary-lbl">Total Focused Time</span>
          </div>
        </div>

        <div className="summary-card glass-panel">
          <Award className="summary-icon success" size={20} />
          <div className="summary-info">
            <span className="summary-val">{filteredHistory.filter(s => !s.interrupted && s.mode === 'focus').length}</span>
            <span className="summary-lbl">Completed Blocks</span>
          </div>
        </div>

        <div className="summary-card glass-panel">
          <Calendar className="summary-icon warning" size={20} />
          <div className="summary-info">
            <span className="summary-val">{getCompletionRate()}%</span>
            <span className="summary-lbl">Completion Rate</span>
          </div>
        </div>
      </div>

      {/* Actions and Filters Bar */}
      <div className="history-filters-actions-bar">
        <div className="history-filters-group glass-panel">
          <Filter size={14} className="filter-icon" />
          <button 
            className={`history-filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`history-filter-btn ${filterType === 'today' ? 'active' : ''}`}
            onClick={() => setFilterType('today')}
          >
            Today
          </button>
          <button 
            className={`history-filter-btn ${filterType === 'week' ? 'active' : ''}`}
            onClick={() => setFilterType('week')}
          >
            This Week
          </button>
          <button 
            className={`history-filter-btn ${filterType === 'month' ? 'active' : ''}`}
            onClick={() => setFilterType('month')}
          >
            This Month
          </button>
          <button 
            className={`history-filter-btn ${filterType === 'year' ? 'active' : ''}`}
            onClick={() => setFilterType('year')}
          >
            This Year
          </button>
        </div>

        <button className="btn-glass csv-export-btn" onClick={exportToCSV} disabled={filteredHistory.length === 0}>
          <FileSpreadsheet size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Sessions History Table */}
      <div className="history-table-wrapper glass-panel">
        {loading ? (
          <div className="table-loader-state">
            <div className="loader"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="table-empty-state">
            <p>No logged focus sessions match the selected filters.</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Planned</th>
                <th>Focused Time</th>
                <th>Status</th>
                <th>Associated Task</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((session) => (
                <tr key={session._id} className={session.interrupted ? 'row-interrupted' : ''}>
                  <td className="cell-date">
                    <span>{new Date(session.date || session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="cell-time">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="cell-mode">
                    <span className={`mode-badge ${session.mode.replace(' ', '-')}`}>{session.mode}</span>
                  </td>
                  <td>{session.duration} min</td>
                  <td>{session.actualCompletedMinutes} min</td>
                  <td className="cell-status">
                    <span className={`status-badge ${session.interrupted ? 'interrupted' : 'completed'}`}>
                      {session.interrupted ? 'Interrupted' : 'Completed'}
                    </span>
                  </td>
                  <td className="cell-task">
                    {session.task?.title || <span className="none-text">N/A</span>}
                  </td>
                  <td>
                    <button 
                      className="log-delete-btn"
                      onClick={() => deleteSession(session._id)}
                      title="Delete focus log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;
