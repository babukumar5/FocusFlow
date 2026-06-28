import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Maximize, Minimize } from 'lucide-react';
import './PomodoroTimer.css';

const MODES = {
  FOCUS: { label: 'Focus', time: 25 * 60, color: 'var(--accent-color)' },
  SHORT_BREAK: { label: 'Short Break', time: 5 * 60, color: 'var(--success-color)' },
  LONG_BREAK: { label: 'Long Break', time: 15 * 60, color: '#ff9f0a' },
};

const PomodoroTimer = () => {
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

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
    setIsActive(false);
    playNotification();
    if (Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: `Time for a ${mode === 'FOCUS' ? 'break' : 'focus session'}.`,
      });
    }
    // Auto switch logic
    if (mode === 'FOCUS') {
      switchMode('SHORT_BREAK');
    } else {
      switchMode('FOCUS');
    }
  };

  const playNotification = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
    audio.play().catch(e => console.log('Audio play failed', e));
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsActive(false);
  };

  const toggleTimer = () => {
    if (!isActive && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const skipTimer = () => {
    handleComplete();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
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

  const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;
  const strokeDashoffset = 880 - (880 * progress) / 100; // 880 is approx circumference of r=140

  return (
    <div className={`pomodoro-container glass-panel ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <button className="fullscreen-btn" onClick={toggleFullscreen} aria-label="Toggle Fullscreen">
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      <div className="mode-selector">
        {Object.entries(MODES).map(([key, config]) => (
          <button
            key={key}
            className={`mode-btn ${mode === key ? 'active' : ''}`}
            onClick={() => switchMode(key)}
          >
            {config.label}
          </button>
        ))}
      </div>

      <div className="timer-circle-container">
        <svg className="progress-ring" width="320" height="320">
          <circle
            className="progress-ring__circle-bg"
            stroke="var(--glass-border)"
            strokeWidth="8"
            fill="transparent"
            r="140"
            cx="160"
            cy="160"
          />
          <circle
            className="progress-ring__circle"
            stroke={MODES[mode].color}
            strokeWidth="8"
            fill="transparent"
            r="140"
            cx="160"
            cy="160"
            style={{ strokeDashoffset, strokeDasharray: 880 }}
          />
        </svg>
        <div className="time-display">{formatTime(timeLeft)}</div>
      </div>

      <div className="timer-controls">
        <button className="control-btn" onClick={resetTimer} title="Reset">
          <RotateCcw size={24} />
        </button>
        <button className="control-btn primary" onClick={toggleTimer}>
          {isActive ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <button className="control-btn" onClick={skipTimer} title="Skip">
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
