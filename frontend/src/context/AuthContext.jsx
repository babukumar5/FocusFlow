import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001/api'
  : 'https://focusflow-vo61.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('focusflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('focusflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('focusflow_user');
  };

  const updateProfile = async (profileData) => {
    if (!user) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        // Sync token back into returned data if not present (since profile update returns new token or keeps same token)
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('focusflow_user', JSON.stringify(updatedUser));
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const updateSettings = async (settingsData) => {
    if (!user) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch(`${API_BASE}/auth/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, settings: data.settings };
        setUser(updatedUser);
        localStorage.setItem('focusflow_user', JSON.stringify(updatedUser));
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to update settings' };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateProfile, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};
