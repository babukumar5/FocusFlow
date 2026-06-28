import React, { useContext, useState } from 'react';
import { TaskContext } from '../context/TaskContext';
import { CheckCircle, Circle, Trash2, Edit2, GripVertical } from 'lucide-react';
import './TaskList.css';

const TaskList = () => {
  const { tasks, addTask, updateTask, deleteTask, loading } = useContext(TaskContext);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({ title: newTaskTitle, priority: 'medium' });
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (task) => {
    updateTask(task._id, { status: task.status === 'completed' ? 'todo' : 'completed' });
  };

  if (loading) {
    return (
      <div className="task-list-container">
        <div className="skeleton-task"></div>
        <div className="skeleton-task"></div>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          type="text"
          placeholder="What are you working on?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="add-task-input glass-panel"
        />
        <button type="submit" className="btn-primary">Add</button>
      </form>

      <div className="tasks">
        {tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Add one above!</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className={`task-item glass-panel ${task.status === 'completed' ? 'completed' : ''}`}>
              <div className="task-drag-handle">
                <GripVertical size={16} />
              </div>
              <button 
                className="task-checkbox" 
                onClick={() => toggleTaskStatus(task)}
              >
                {task.status === 'completed' ? (
                  <CheckCircle size={20} className="checked-icon" />
                ) : (
                  <Circle size={20} className="unchecked-icon" />
                )}
              </button>
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                {task.priority && (
                  <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                )}
              </div>
              <div className="task-actions">
                <button className="icon-btn-small" aria-label="Edit">
                  <Edit2 size={16} />
                </button>
                <button 
                  className="icon-btn-small danger" 
                  aria-label="Delete"
                  onClick={() => deleteTask(task._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
