import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Maximize, Minimize, Sparkles } from 'lucide-react';
import usePomodoro from '../hooks/usePomodoro';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  const {
    mode,
    timeLeft,
    isActive,
    totalDuration,
    isFullscreen,
    isImmersiveFocus,
    isCustomMode,
    customFocus,
    customShort,
    customLong,
    toggleTimer,
    resetTimer,
    skipTimer,
    switchMode,
    toggleFullscreen,
    toggleImmersiveFocus,
    setIsCustomMode,
    setCustomFocus,
    setCustomShort,
    setCustomLong
  } = usePomodoro();

  const containerRef = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getModeColor = () => {
    if (mode === 'FOCUS') return 'var(--accent-color)';
    if (mode === 'SHORT_BREAK') return 'var(--success-color)';
    return 'var(--warning-color)';
  };

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  
  // Progress Ring configurations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <div 
      className={`pomodoro-container glass-panel ${isFullscreen ? 'fullscreen' : ''} ${isImmersiveFocus ? 'immersive-active' : ''}`} 
      ref={containerRef}
    >
      <div className="timer-header-actions">
        <button 
          className={`immersive-toggle-btn ${isImmersiveFocus ? 'active' : ''}`}
          onClick={toggleImmersiveFocus}
          title="Toggle Immersive Focus Mode"
        >
          <Sparkles size={16} />
          <span>{isImmersiveFocus ? 'Exit Focus' : 'Focus Mode'}</span>
        </button>

        <button className="timer-action-icon-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      {!isImmersiveFocus && (
        <div className="presets-toggle-row">
          <button 
            className={`preset-select-tab ${!isCustomMode ? 'active' : ''}`}
            onClick={() => setIsCustomMode(false)}
          >
            Presets
          </button>
          <button 
            className={`preset-select-tab ${isCustomMode ? 'active' : ''}`}
            onClick={() => setIsCustomMode(true)}
          >
            Custom
          </button>
        </div>
      )}

      {isCustomMode && !isImmersiveFocus && (
        <div className="custom-timers-input-row animate-fade-in">
          <div className="input-group-timer">
            <label>Focus</label>
            <input 
              type="number" 
              value={customFocus} 
              onChange={(e) => setCustomFocus(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="input-group-timer">
            <label>Short</label>
            <input 
              type="number" 
              value={customShort} 
              onChange={(e) => setCustomShort(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="input-group-timer">
            <label>Long</label>
            <input 
              type="number" 
              value={customLong} 
              onChange={(e) => setCustomLong(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>
      )}

      {!isImmersiveFocus && (
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'FOCUS' ? 'active' : ''}`}
            onClick={() => switchMode('FOCUS')}
            style={{ '--active-border': 'var(--accent-color)' }}
          >
            Focus
          </button>
          <button
            className={`mode-btn ${mode === 'SHORT_BREAK' ? 'active' : ''}`}
            onClick={() => switchMode('SHORT_BREAK')}
            style={{ '--active-border': 'var(--success-color)' }}
          >
            Short Break
          </button>
          <button
            className={`mode-btn ${mode === 'LONG_BREAK' ? 'active' : ''}`}
            onClick={() => switchMode('LONG_BREAK')}
            style={{ '--active-border': 'var(--warning-color)' }}
          >
            Long Break
          </button>
        </div>
      )}

      <div className="timer-circle-container">
        <svg className="progress-ring" width="280" height="280">
          <circle
            className="progress-ring__circle-bg"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
            fill="transparent"
            r={radius}
            cx="140"
            cy="140"
          />
          <circle
            className="progress-ring__circle"
            stroke={getModeColor()}
            strokeWidth="8"
            fill="transparent"
            r={radius}
            cx="140"
            cy="140"
            style={{ 
              strokeDashoffset, 
              strokeDasharray: circumference,
              transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease'
            }}
          />
        </svg>
        <div className="time-display-wrapper">
          <span className="time-display">{formatTime(timeLeft)}</span>
          <span className="time-mode-label">{mode === 'FOCUS' ? 'Focus' : 'Break'}</span>
        </div>
      </div>

      <div className="timer-controls">
        <button className="control-btn" onClick={resetTimer} title="Reset Timer">
          <RotateCcw size={20} />
        </button>
        <button 
          className="control-btn primary" 
          onClick={toggleTimer}
          style={{ 
            background: `linear-gradient(135deg, ${getModeColor()}, rgba(0,0,0,0.1))`,
            boxShadow: `0 8px 24px ${getModeColor()}40`
          }}
        >
          {isActive ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button className="control-btn" onClick={skipTimer} title="Skip/Complete">
          <SkipForward size={20} />
        </button>
      </div>

      {isImmersiveFocus && (
        <div className="immersive-bg-glows">
          <div className="immersive-glow-1" style={{ background: getModeColor() }}></div>
          <div className="immersive-glow-2" style={{ background: getModeColor() }}></div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
