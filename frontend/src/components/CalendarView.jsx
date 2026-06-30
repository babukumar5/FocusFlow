import React, { useState, useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import { ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';
import './CalendarView.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView = () => {
  const { tasks, addTask } = useContext(TaskContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState(null); // tasks for a specific clicked day
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  // Get weekday index of the 1st of the month
  const startDayIndex = new Date(year, month, 1).getDay();

  // Get previous month padding days
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayTasks(null);
    setShowQuickAdd(false);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayTasks(null);
    setShowQuickAdd(false);
  };

  // Check if a date matches task due dates
  const getTasksForDate = (dayNum, targetMonth, targetYear) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return d.getDate() === dayNum && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });
  };

  const handleDayClick = (dayNum) => {
    const dayTasks = getTasksForDate(dayNum, month, year);
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    
    setSelectedDayTasks(dayTasks);
    setSelectedDateKey(dateKey);
    setShowQuickAdd(true);
  };

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !selectedDateKey) return;

    addTask({
      title: quickTaskTitle.trim(),
      dueDate: new Date(selectedDateKey),
      priority: 'medium',
      category: 'Scheduled'
    });

    setQuickTaskTitle('');
    
    // Refresh local selection with new task
    setTimeout(() => {
      setSelectedDayTasks([...selectedDayTasks, { title: quickTaskTitle, priority: 'medium', category: 'Scheduled', status: 'todo' }]);
    }, 200);
  };

  // Compile calendar cells
  const cells = [];
  
  // Padding from previous month
  for (let i = startDayIndex - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      monthOffset: -1
    });
  }

  // Current month days
  const today = new Date();
  for (let i = 1; i <= totalDays; i++) {
    const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
    cells.push({
      day: i,
      isCurrentMonth: true,
      isToday,
      monthOffset: 0
    });
  }

  // Padding from next month (grid of 42 cells)
  const remainingCells = 42 - cells.length;
  for (let i = 1; i <= remainingCells; i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      monthOffset: 1
    });
  }

  return (
    <div className="calendar-widget-container">
      {/* Calendar Month Selector */}
      <div className="calendar-month-selector">
        <button onClick={handlePrevMonth} className="icon-btn-small glass-panel"><ChevronLeft size={16} /></button>
        <h3>{MONTHS[month]} {year}</h3>
        <button onClick={handleNextMonth} className="icon-btn-small glass-panel"><ChevronRight size={16} /></button>
      </div>

      {/* Grid Container */}
      <div className="calendar-grid-card glass-panel">
        <div className="days-of-week-header">
          {DAYS_OF_WEEK.map(d => <span key={d}>{d}</span>)}
        </div>

        <div className="calendar-days-grid">
          {cells.map((cell, idx) => {
            const dateTasks = cell.isCurrentMonth ? getTasksForDate(cell.day, month, year) : [];
            const hasTasks = dateTasks.length > 0;

            return (
              <button
                key={idx}
                type="button"
                className={`calendar-day-cell ${!cell.isCurrentMonth ? 'inactive' : ''} ${cell.isToday ? 'today' : ''} ${selectedDateKey === `${year}-${(month + 1).toString().padStart(2, '0')}-${cell.day.toString().padStart(2, '0')}` && cell.isCurrentMonth ? 'selected' : ''}`}
                onClick={() => cell.isCurrentMonth && handleDayClick(cell.day)}
                disabled={!cell.isCurrentMonth}
              >
                <span className="day-number">{cell.day}</span>
                {hasTasks && (
                  <div className="task-indicators-dots">
                    {dateTasks.slice(0, 3).map((t, tIdx) => (
                      <span key={tIdx} className={`indicator-dot ${t.priority}`} title={t.title} />
                    ))}
                    {dateTasks.length > 3 && <span className="indicator-plus">+</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda View */}
      {showQuickAdd && (
        <div className="day-agenda-panel glass-panel animate-fade-in">
          <div className="agenda-header">
            <div className="agenda-title">
              <Calendar size={16} />
              <span>Agenda: {new Date(selectedDateKey).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <button className="close-btn-small" onClick={() => setShowQuickAdd(false)}>✕</button>
          </div>

          <div className="agenda-tasks-list">
            {selectedDayTasks && selectedDayTasks.length === 0 ? (
              <p className="no-tasks-scheduled">No tasks scheduled for this day.</p>
            ) : (
              selectedDayTasks?.map((task, idx) => (
                <div key={idx} className={`agenda-task-item priority-${task.priority}`}>
                  <span className={`agenda-status-dot ${task.status}`}></span>
                  <span className="agenda-task-title">{task.title}</span>
                  {task.category && <span className="agenda-task-cat"><Tag size={8} />{task.category}</span>}
                </div>
              ))
            )}
          </div>

          {/* Quick Schedule Input */}
          <form onSubmit={handleQuickAddSubmit} className="quick-add-task-form">
            <input
              type="text"
              placeholder="Schedule quick task..."
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary quick-add-btn">Add</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
