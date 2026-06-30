import React, { useState, useEffect, useRef, useContext } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Maximize, Minimize, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { FocusContext } from '../context/FocusContext';
import './PomodoroTimer.css';

const SOUND_PRESETS = {
  digital_watch: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  chime: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
  gong: 'https://actions.google.com/sounds/v1/ambiences/gong.ogg',
  bell: 'https://actions.google.com/sounds/v1/clock/bell_chime.ogg',
};

const PomodoroTimer = () => {
  const { user } = useContext(AuthContext);
  const { logSession } = useContext(FocusContext);

  const settings = user?.settings || {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    soundType: 'digital_watch',
    soundVolume: 0.8,
    browserNotifications: true,
    autoStartBreaks: false,
    autoStartTimers: false
  };

  const [mode, setMode] = useState('FOCUS'); // FOCUS, SHORT_BREAK, LONG_BREAK
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImmersiveFocus, setIsImmersiveFocus] = useState(false); // Immersive Focus Mode
  
  // Custom Timer Settings
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customFocus, setCustomFocus] = useState(25);
  const [customShort, setCustomShort] = useState(5);
  const [customLong, setCustomLong] = useState(15);

  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Sync timing dynamically with settings/mode
  const getModeDuration = (currentMode) => {
    if (isCustomMode) {
      if (currentMode === 'FOCUS') return customFocus * 60;
      if (currentMode === 'SHORT_BREAK') return customShort * 60;
      if (currentMode === 'LONG_BREAK') return customLong * 60;
    } else {
      if (currentMode === 'FOCUS') return settings.focusTime * 60;
      if (currentMode === 'SHORT_BREAK') return settings.shortBreakTime * 60;
      if (currentMode === 'LONG_BREAK') return settings.longBreakTime * 60;
    }
    return 25 * 60;
  };

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(getModeDuration(mode));
    }
  }, [settings.focusTime, settings.shortBreakTime, settings.longBreakTime, mode, isCustomMode, customFocus, customShort, customLong]);

  // Tick logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    
    // Play alert sound
    playNotificationSound();

    // Trigger OS browser notification
    if (settings.browserNotifications && Notification.permission === 'granted') {
      new Notification('Timer Finished!', {
        body: mode === 'FOCUS' ? 'Great work! Take a break.' : 'Break is over! Let\'s get back to work.',
        icon: '/favicon.ico'
      });
    }

    // Log Focus Session if complete
    if (mode === 'FOCUS') {
      const actualDuration = isCustomMode ? customFocus : settings.focusTime;
      logSession({
        duration: actualDuration,
        completed: true
      });
    }

    // Auto transitions
    let nextMode = 'FOCUS';
    if (mode === 'FOCUS') {
      nextMode = 'SHORT_BREAK';
    }

    setMode(nextMode);
    setTimeLeft(getModeDuration(nextMode));

    // Handle auto-start
    if (nextMode === 'FOCUS' && settings.autoStartTimers) {
      setTimeout(() => setIsActive(true), 500);
    } else if (nextMode !== 'FOCUS' && settings.autoStartBreaks) {
      setTimeout(() => setIsActive(true), 500);
    }
  };

  const playNotificationSound = () => {
    const soundUrl = SOUND_PRESETS[settings.soundType] || SOUND_PRESETS.digital_watch;
    const audio = new Audio(soundUrl);
    audio.volume = settings.soundVolume !== undefined ? settings.soundVolume : 0.8;
    audio.play().catch(e => console.log('Audio playing blocked by browser:', e));
  };

  const toggleTimer = () => {
    if (!isActive && settings.browserNotifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getModeDuration(mode));
  };

  const skipTimer = () => {
    handleComplete();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(getModeDuration(newMode));
    setIsActive(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const totalModeDuration = getModeDuration(mode);
  const progress = totalModeDuration > 0 ? ((totalModeDuration - timeLeft) / totalModeDuration) * 100 : 0;
  
  // Progress Ring configurations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  // Immersive Focus Mode toggler
  const toggleImmersiveFocus = () => {
    setIsImmersiveFocus(!isImmersiveFocus);
  };

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
