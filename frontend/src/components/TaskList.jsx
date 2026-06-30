import React, { useContext, useState } from 'react';
import { TaskContext } from '../context/TaskContext';
import { 
  CheckCircle, Circle, Trash2, Edit3, Plus, 
  Calendar, Tag, Folder, AlertCircle, Search, Filter, X 
} from 'lucide-react';
import './TaskList.css';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'var(--accent-color)' },
  { id: 'in-progress', title: 'In Progress', color: 'var(--warning-color)' },
  { id: 'completed', title: 'Completed', color: 'var(--success-color)' }
];

const TaskList = () => {
  const { tasks, addTask, updateTask, deleteTask, loading } = useContext(TaskContext);
  
  // Create / Edit Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Form handlers
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

    addTask({
      title,
      description,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: parsedTags,
      subtasks
    });

    resetForm();
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (!title.trim() || !activeTask) return;

    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

    updateTask(activeTask._id, {
      title,
      description,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: parsedTags,
      subtasks
    });

    setShowEditModal(false);
    resetForm();
  };

  const openEditModal = (task) => {
    setActiveTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority || 'medium');
    setCategory(task.category || 'General');
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setTagsInput(task.tags ? task.tags.join(', ') : '');
    setSubtasks(task.subtasks || []);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('General');
    setDueDate('');
    setTagsInput('');
    setSubtasks([]);
    setNewSubtaskTitle('');
    setShowAddForm(false);
  };

  // Subtask management in local state
  const addSubtaskLocal = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const removeSubtaskLocal = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const toggleSubtaskLocal = (index) => {
    setSubtasks(subtasks.map((s, i) => i === index ? { ...s, completed: !s.completed } : s));
  };

  // Drag & Drop handlers
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTask(taskId, { status: targetStatus });
    }
    setDraggedTaskId(null);
  };

  // Filter tasks based on Search, Priority, and Category
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  // Calculate unique categories for filters
  const categoriesList = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  const getSubtasksProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(s => s.completed).length;
    const percentage = Math.round((completed / task.subtasks.length) * 100);
    return { completed, total: task.subtasks.length, percentage };
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
  };

  if (loading) {
    return (
      <div className="skeleton-kanban">
        <div className="skeleton-column glass-panel"></div>
        <div className="skeleton-column glass-panel"></div>
        <div className="skeleton-column glass-panel"></div>
      </div>
    );
  }

  return (
    <div className="kanban-wrapper">
      {/* Search & Filter Header */}
      <div className="kanban-header-controls">
        <div className="search-bar-wrapper glass-panel">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-select-wrapper glass-panel">
            <Filter size={14} className="filter-icon" />
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-select-wrapper glass-panel">
            <Folder size={14} className="filter-icon" />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button className="btn-primary add-task-btn" onClick={() => setShowAddForm(true)}>
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className={`kanban-column glass-panel ${draggedTaskId ? 'drag-over-active' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-title-row" style={{ '--column-accent': col.color }}>
                <h3>{col.title}</h3>
                <span className="task-count-badge">{colTasks.length}</span>
              </div>

              <div className="column-tasks-container">
                {colTasks.length === 0 ? (
                  <div className="column-empty-state">
                    <p>Drop tasks here</p>
                  </div>
                ) : (
                  colTasks.map(task => {
                    const progress = getSubtasksProgress(task);
                    return (
                      <div 
                        key={task._id} 
                        className={`task-card glass-panel priority-${task.priority} ${task.status === 'completed' ? 'completed-card' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                      >
                        <div className="task-card-header">
                          <span className="task-card-category">{task.category || 'General'}</span>
                          <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                        </div>

                        <h4 className="task-card-title">{task.title}</h4>
                        {task.description && <p className="task-card-desc">{task.description}</p>}

                        {/* Subtasks Progress */}
                        {progress && (
                          <div className="task-card-progress">
                            <div className="progress-details">
                              <span>Subtasks</span>
                              <span>{progress.completed}/{progress.total} ({progress.percentage}%)</span>
                            </div>
                            <div className="progress-track">
                              <div className="progress-fill" style={{ width: `${progress.percentage}%` }}></div>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="task-card-tags">
                            {task.tags.map(t => (
                              <span key={t} className="tag-pill"><Tag size={10} />{t}</span>
                            ))}
                          </div>
                        )}

                        <div className="task-card-footer">
                          {task.dueDate ? (
                            <span className={`due-date-display ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'overdue' : ''}`}>
                              {isOverdue(task.dueDate) && task.status !== 'completed' ? <AlertCircle size={12} /> : <Calendar size={12} />}
                              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </span>
                          ) : <span />}

                          <div className="card-actions">
                            <button className="card-action-btn" onClick={() => openEditModal(task)} title="Edit Task">
                              <Edit3 size={14} />
                            </button>
                            <button className="card-action-btn danger" onClick={() => deleteTask(task._id)} title="Delete Task">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TASK SLIDE-OVER / FORM POPUP */}
      {showAddForm && (
        <div className="form-modal-overlay">
          <div className="form-modal-container glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="close-btn" onClick={resetForm}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateTask} className="task-modal-form">
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Design Dashboard UI"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Provide context or details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-row-double">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Work, Personal"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-double">
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="design, coding, research"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary modal-submit">Create Task</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK DIALOG MODAL */}
      {showEditModal && activeTask && (
        <div className="form-modal-overlay">
          <div className="form-modal-container glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>Edit Task Details</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdateTask} className="task-modal-form">
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-row-double">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-double">
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="modal-subtasks-section">
                <label>Subtask Checklist</label>
                <div className="modal-subtasks-list">
                  {subtasks.map((sub, idx) => (
                    <div key={idx} className="subtask-edit-row">
                      <button 
                        type="button" 
                        className="subtask-checkbox-btn"
                        onClick={() => toggleSubtaskLocal(idx)}
                      >
                        {sub.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                      </button>
                      <span className={sub.completed ? 'strike' : ''}>{sub.title}</span>
                      <button 
                        type="button" 
                        className="subtask-delete-btn" 
                        onClick={() => removeSubtaskLocal(idx)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="add-subtask-row">
                  <input 
                    type="text" 
                    placeholder="Add step..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  />
                  <button type="button" className="btn-glass btn-small" onClick={addSubtaskLocal}>Add</button>
                </div>
              </div>

              <button type="submit" className="btn-primary modal-submit">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
