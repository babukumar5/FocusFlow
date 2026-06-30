import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const FocusContext = createContext();

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001/api'
  : 'https://focusflow-vo61.onrender.com/api';

export const FocusProvider = ({ children }) => {
  const [stats, setStats] = useState({
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    totalMinutes: 0,
    totalSessions: 0,
    charts: { daily: [], weekly: [], monthly: [] }
  });
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/focus/stats`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching focus stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const logSession = async (sessionData) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/focus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(sessionData),
      });
      if (res.ok) {
        fetchStats(); // Refresh stats after logging
      }
    } catch (error) {
      console.error('Error logging focus session', error);
    }
  };

  return (
    <FocusContext.Provider value={{ stats, loading, fetchStats, logSession }}>
      {children}
    </FocusContext.Provider>
  );
};
