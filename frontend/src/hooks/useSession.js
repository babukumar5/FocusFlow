import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FocusContext } from '../context/FocusContext';
import { enqueueMutation } from '../utils/syncQueue';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001/api'
  : 'https://focusflow-vo61.onrender.com/api';

const useSession = () => {
  const { user, login } = useContext(AuthContext);
  const { fetchStats } = useContext(FocusContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/focus/history`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Error fetching focus logs history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const logSession = async (sessionData) => {
    if (!user) return;
    
    // Optimistic UI update: prepend to local state
    const tempId = 'temp-' + Date.now();
    const optimisticSession = {
      _id: tempId,
      user: user._id,
      ...sessionData,
      createdAt: new Date().toISOString()
    };
    setHistory(prev => [optimisticSession, ...prev]);

    if (!navigator.onLine) {
      // Offline, queue the POST request
      enqueueMutation(`${API_BASE}/focus/session`, 'POST', sessionData, user.token);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/focus/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (res.ok) {
        const savedSession = await res.json();
        // Replace temp optimistic item with saved session
        setHistory(prev => prev.map(s => s._id === tempId ? savedSession : s));
        
        // Dynamic stats refresh
        fetchStats();
        
        // Auto update profile streak in auth state if it returned modified user/streak info
        if (sessionData.mode === 'focus' && !sessionData.interrupted) {
          fetchUserProfile();
        }
      }
    } catch (e) {
      console.error('Error logging focus session, queueing request', e);
      enqueueMutation(`${API_BASE}/focus/session`, 'POST', sessionData, user.token);
    }
  };

  // Re-fetch user profile to sync updated streaks to AuthState
  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        login({ ...user, ...updatedProfile });
      }
    } catch (e) {
      console.error('Error refreshing streak profile info', e);
    }
  };

  const deleteSession = async (id) => {
    if (!user) return;
    
    // Optimistic delete
    setHistory(prev => prev.filter(s => s._id !== id));

    if (!navigator.onLine) {
      enqueueMutation(`${API_BASE}/focus/session/${id}`, 'DELETE', null, user.token);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/focus/session/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (e) {
      console.error('Error deleting focus session, queueing request', e);
      enqueueMutation(`${API_BASE}/focus/session/${id}`, 'DELETE', null, user.token);
    }
  };

  const exportToCSV = () => {
    if (!history || history.length === 0) return;
    
    const headers = ['Date', 'Planned Duration (min)', 'Actual Focus (min)', 'Start Time', 'End Time', 'Mode', 'Status'];
    const rows = history.map(s => [
      new Date(s.date).toLocaleDateString(),
      s.duration,
      s.actualCompletedMinutes,
      new Date(s.startTime).toLocaleTimeString(),
      new Date(s.endTime).toLocaleTimeString(),
      s.mode,
      s.interrupted ? 'Interrupted' : 'Completed'
    ]);
    
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `focusflow_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    history,
    loading,
    logSession,
    deleteSession,
    exportToCSV,
    refreshHistory: fetchHistory
  };
};

export default useSession;
