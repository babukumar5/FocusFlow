import { useContext } from 'react';
import { FocusContext } from '../context/FocusContext';

const useStatistics = () => {
  const { stats, loading, fetchStats } = useContext(FocusContext);

  return {
    focusedToday: stats?.focusedToday || 0,
    focusedThisWeek: stats?.focusedThisWeek || 0,
    focusedThisMonth: stats?.focusedThisMonth || 0,
    focusedThisYear: stats?.focusedThisYear || 0,
    totalLifetimeFocus: stats?.totalLifetimeFocus || 0,
    completedSessions: stats?.completedSessions || 0,
    averageSessionLength: stats?.averageSessionLength || 0,
    longestSession: stats?.longestSession || 0,
    charts: stats?.charts || { daily: [], weekly: [], monthly: [], category: [], heatmap: [] },
    loading,
    refreshStats: fetchStats
  };
};

export default useStatistics;
