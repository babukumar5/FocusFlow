import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const HabitContext = createContext();

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001/api'
  : 'https://focusflow-vo61.onrender.com/api';

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchHabits = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/habits`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (error) {
      console.error('Error fetching habits', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user]);

  const addHabit = async (habitData) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(habitData),
      });
      if (res.ok) {
        const data = await res.json();
        setHabits([...habits, data]);
      }
    } catch (error) {
      console.error('Error adding habit', error);
    }
  };

  const toggleHabit = async (id) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/habits/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(habits.map(h => h._id === id ? data : h));
      }
    } catch (error) {
      console.error('Error toggling habit', error);
    }
  };

  const deleteHabit = async (id) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/habits/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        setHabits(habits.filter(h => h._id !== id));
      }
    } catch (error) {
      console.error('Error deleting habit', error);
    }
  };

  return (
    <HabitContext.Provider value={{ habits, loading, fetchHabits, addHabit, toggleHabit, deleteHabit }}>
      {children}
    </HabitContext.Provider>
  );
};
