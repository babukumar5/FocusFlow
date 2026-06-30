import React, { useContext, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import useStatistics from '../hooks/useStatistics';
import { TaskContext } from '../context/TaskContext';
import { ThemeContext } from '../context/ThemeContext';
import { Clock, TrendingUp, CheckCircle2, BarChart } from 'lucide-react';
import './ProductivityStats.css';

const ProductivityStats = () => {
  const {
    focusedToday,
    totalLifetimeFocus,
    completedSessions,
    charts,
    loading
  } = useStatistics();

  const { tasks } = useContext(TaskContext);
  const { isDark } = useContext(ThemeContext);
  const [filterType, setFilterType] = useState('daily'); // 'daily', 'weekly', 'monthly'

  const textColor = isDark ? '#a1a1a6' : '#86868b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const getChartData = () => {
    if (!charts) return [];
    if (filterType === 'daily') return charts.daily || [];
    if (filterType === 'weekly') return charts.weekly || [];
    return charts.monthly || [];
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(t => t.status === 'completed').length;
  };

  const formatHours = (minutes) => {
    if (!minutes) return '0h';
    return `${(minutes / 60).toFixed(1)}h`;
  };

  return (
    <div className="stats-container-wrapper">
      {/* Mini Metrics Cards */}
      <div className="stats-cards-grid">
        <div className="mini-metric-card glass-panel">
          <Clock size={16} className="metric-icon accent" />
          <div className="metric-info">
            <span className="metric-val">{formatHours(focusedToday)}</span>
            <span className="metric-lbl">Focused Today</span>
          </div>
        </div>

        <div className="mini-metric-card glass-panel">
          <TrendingUp size={16} className="metric-icon warning" />
          <div className="metric-info">
            <span className="metric-val">{formatHours(totalLifetimeFocus)}</span>
            <span className="metric-lbl">Total Focus</span>
          </div>
        </div>

        <div className="mini-metric-card glass-panel">
          <CheckCircle2 size={16} className="metric-icon success" />
          <div className="metric-info">
            <span className="metric-val">{getCompletedTasksCount()}</span>
            <span className="metric-lbl">Tasks Done</span>
          </div>
        </div>

        <div className="mini-metric-card glass-panel">
          <BarChart size={16} className="metric-icon info" />
          <div className="metric-info">
            <span className="metric-val">{completedSessions}</span>
            <span className="metric-lbl">Sessions Logged</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section-card glass-panel">
        <div className="chart-header-row">
          <div className="chart-titles">
            <h4>Focus Trends</h4>
            <p>Track your flow periods over time</p>
          </div>
          <div className="chart-filters-toggle">
            <button 
              className={`filter-toggle-btn ${filterType === 'daily' ? 'active' : ''}`}
              onClick={() => setFilterType('daily')}
            >
              Daily
            </button>
            <button 
              className={`filter-toggle-btn ${filterType === 'weekly' ? 'active' : ''}`}
              onClick={() => setFilterType('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`filter-toggle-btn ${filterType === 'monthly' ? 'active' : ''}`}
              onClick={() => setFilterType('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="recharts-chart-wrapper">
          {loading ? (
            <div className="table-loader-state" style={{ height: '100%' }}>
              <div className="loader"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getChartData()}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: textColor, fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: textColor, fontSize: 11 }} 
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} 
                  contentStyle={{ 
                    backgroundColor: 'var(--glass-bg)', 
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    color: 'var(--text-primary)',
                    backdropFilter: 'blur(20px)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="focusTime" 
                  name="Focus Minutes"
                  stroke="var(--accent-color)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorFocus)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductivityStats;
