import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const GoalContext = createContext();

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001/api'
  : 'https://focusflow-vo61.onrender.com/api';

export const GoalProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const addGoal = async (goalData) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(goalData),
      });
      if (res.ok) {
        const data = await res.json();
        setGoals([...goals, data]);
      }
    } catch (error) {
      console.error('Error adding goal', error);
    }
  };

  const updateGoalProgress = async (id, currentValue) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ currentValue }),
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(goals.map(g => g._id === id ? data : g));
      }
    } catch (error) {
      console.error('Error updating goal progress', error);
    }
  };

  const deleteGoal = async (id) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        setGoals(goals.filter(g => g._id !== id));
      }
    } catch (error) {
      console.error('Error deleting goal', error);
    }
  };

  return (
    <GoalContext.Provider value={{ goals, loading, fetchGoals, addGoal, updateGoalProgress, deleteGoal }}>
      {children}
    </GoalContext.Provider>
  );
};
