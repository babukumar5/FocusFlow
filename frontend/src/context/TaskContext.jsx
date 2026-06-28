import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/tasks', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addTask = async (taskData) => {
    try {
      const res = await fetch('http://localhost:5001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      setTasks([data, ...tasks]);
    } catch (error) {
      console.error('Error adding task', error);
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await fetch(`http://localhost:5001/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      setTasks(tasks.map((task) => (task._id === id ? data : task)));
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
