import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { FocusProvider } from './context/FocusContext';
import { HabitProvider } from './context/HabitContext';
import { GoalProvider } from './context/GoalContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <FocusProvider>
            <HabitProvider>
              <GoalProvider>
                <App />
              </GoalProvider>
            </HabitProvider>
          </FocusProvider>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
