import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import useSession from './useSession';

const SOUND_PRESETS = {
  digital_watch: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  chime: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
  gong: 'https://actions.google.com/sounds/v1/ambiences/gong.ogg',
  bell: 'https://actions.google.com/sounds/v1/clock/bell_chime.ogg',
};

const usePomodoro = () => {
  const { user } = useContext(AuthContext);
  const { logSession } = useSession();

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

  // State
  const [mode, setMode] = useState('FOCUS'); // FOCUS, SHORT_BREAK, LONG_BREAK
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalDuration, setTotalDuration] = useState(settings.focusTime * 60);
  
  // Custom presets
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customFocus, setCustomFocus] = useState(25);
  const [customShort, setCustomShort] = useState(5);
  const [customLong, setCustomLong] = useState(15);
  
  // Screen/Focus mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImmersiveFocus, setIsImmersiveFocus] = useState(false);
  
  // Log tracking timestamps
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const timerRef = useRef(null);

  // Get active duration
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

  // 1. Initial State Restoration
  useEffect(() => {
    const savedMode = localStorage.getItem('focusflow_timer_mode');
    const savedIsActive = localStorage.getItem('focusflow_timer_is_active') === 'true';
    const savedIsPaused = localStorage.getItem('focusflow_timer_is_paused') === 'true';
    const savedTargetTimestamp = localStorage.getItem('focusflow_timer_target_timestamp');
    const savedTimeLeft = localStorage.getItem('focusflow_timer_time_left');
    const savedStartTime = localStorage.getItem('focusflow_timer_start_time');

    if (savedMode) setMode(savedMode);
    if (savedStartTime) setSessionStartTime(new Date(savedStartTime));

    if (savedIsActive && savedTargetTimestamp) {
      const targetTime = Number(savedTargetTimestamp);
      const remainingSeconds = Math.ceil((targetTime - Date.now()) / 1000);

      if (remainingSeconds > 0) {
        setTimeLeft(remainingSeconds);
        setIsActive(true);
        setIsPaused(false);
      } else {
        // Expired in background, handle completion on mount
        setTimeout(() => handleCompleteTime(savedMode, savedStartTime), 100);
      }
    } else if (savedIsPaused && savedTimeLeft) {
      setTimeLeft(Number(savedTimeLeft));
      setIsActive(false);
      setIsPaused(true);
    } else {
      // Default initial states based on mode
      const initialMode = savedMode || 'FOCUS';
      setTimeLeft(getModeDuration(initialMode));
      setTotalDuration(getModeDuration(initialMode));
    }
  }, [user]);

  // 2. React to timing adjustments when timer is idle
  useEffect(() => {
    if (!isActive && !isPaused) {
      const activeDuration = getModeDuration(mode);
      setTimeLeft(activeDuration);
      setTotalDuration(activeDuration);
    }
  }, [settings.focusTime, settings.shortBreakTime, settings.longBreakTime, mode, isCustomMode, customFocus, customShort, customLong]);

  // 3. LocalStorage persistence updates
  const saveStateToLocalStorage = (active, paused, remaining, target, activeMode, start) => {
    localStorage.setItem('focusflow_timer_is_active', active);
    localStorage.setItem('focusflow_timer_is_paused', paused);
    localStorage.setItem('focusflow_timer_mode', activeMode);
    if (remaining !== null) localStorage.setItem('focusflow_timer_time_left', remaining);
    if (target !== null) localStorage.setItem('focusflow_timer_target_timestamp', target);
    else localStorage.removeItem('focusflow_timer_target_timestamp');
    if (start !== null) localStorage.setItem('focusflow_timer_start_time', start);
    else localStorage.removeItem('focusflow_timer_start_time');
  };

  // 4. Background precise ticking logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        const targetTimestamp = Number(localStorage.getItem('focusflow_timer_target_timestamp'));
        if (targetTimestamp) {
          const secondsRemaining = Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
          setTimeLeft(secondsRemaining);
          
          if (secondsRemaining === 0) {
            handleCompleteTime(mode, sessionStartTime?.toISOString() || new Date().toISOString());
          }
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, mode, sessionStartTime]);

  const handleCompleteTime = (completedMode, startTimeVal) => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setIsPaused(false);

    // Play Sound Alert
    playAlertSound();

    // Trigger Browser Notification
    if (settings.browserNotifications && Notification.permission === 'granted') {
      new Notification('FocusFlow: Session Complete!', {
        body: completedMode === 'FOCUS' ? 'Focused work block finished! Enjoy your break.' : 'Break ended! Ready to lock back in?',
        icon: '/favicon.ico'
      });
    }

    const plannedMinutes = getModeDuration(completedMode) / 60;
    const start = startTimeVal ? new Date(startTimeVal) : new Date(Date.now() - plannedMinutes * 60 * 1000);
    const end = new Date();

    // Log Focus Session to DB
    logSession({
      duration: plannedMinutes,
      actualCompletedMinutes: plannedMinutes,
      startTime: start,
      endTime: end,
      date: start,
      mode: completedMode === 'FOCUS' ? 'focus' : (completedMode === 'SHORT_BREAK' ? 'short break' : 'long break'),
      interrupted: false
    });

    // Auto transition mode
    let nextMode = 'FOCUS';
    if (completedMode === 'FOCUS') {
      nextMode = 'SHORT_BREAK';
    }

    setMode(nextMode);
    const nextDuration = getModeDuration(nextMode);
    setTimeLeft(nextDuration);
    setTotalDuration(nextDuration);
    setSessionStartTime(null);
    saveStateToLocalStorage(false, false, nextDuration, null, nextMode, null);

    // Auto start checks
    if (nextMode === 'FOCUS' && settings.autoStartTimers) {
      setTimeout(() => startTimerSequence(nextMode), 500);
    } else if (nextMode !== 'FOCUS' && settings.autoStartBreaks) {
      setTimeout(() => startTimerSequence(nextMode), 500);
    }
  };

  const playAlertSound = () => {
    const url = SOUND_PRESETS[settings.soundType] || SOUND_PRESETS.digital_watch;
    const audio = new Audio(url);
    audio.volume = settings.soundVolume !== undefined ? settings.soundVolume : 0.8;
    audio.play().catch(e => console.log('Audio blocked', e));
  };

  const startTimerSequence = (targetMode) => {
    const seconds = getModeDuration(targetMode);
    const targetTimestamp = Date.now() + seconds * 1000;
    const start = new Date();

    setSessionStartTime(start);
    setTimeLeft(seconds);
    setTotalDuration(seconds);
    setIsActive(true);
    setIsPaused(false);

    saveStateToLocalStorage(true, false, seconds, targetTimestamp, targetMode, start.toISOString());
  };

  const toggleTimer = () => {
    if (isActive) {
      // Pause
      clearInterval(timerRef.current);
      setIsActive(false);
      setIsPaused(true);

      const targetTimestamp = Number(localStorage.getItem('focusflow_timer_target_timestamp'));
      const secondsLeft = Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
      setTimeLeft(secondsLeft);

      saveStateToLocalStorage(false, true, secondsLeft, null, mode, sessionStartTime?.toISOString() || null);
    } else {
      // Resume or Start
      if (settings.browserNotifications && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      const targetTimestamp = Date.now() + timeLeft * 1000;
      setIsActive(true);
      setIsPaused(false);

      const start = sessionStartTime || new Date();
      if (!sessionStartTime) setSessionStartTime(start);

      saveStateToLocalStorage(true, false, timeLeft, targetTimestamp, mode, start.toISOString());
    }
  };

  const resetTimer = () => {
    // Log interrupted session to DB if focused for >= 1 minute in FOCUS mode
    if (mode === 'FOCUS' && sessionStartTime) {
      const totalPlannedSecs = getModeDuration('FOCUS');
      const focusedSecs = totalPlannedSecs - timeLeft;
      const actualMins = Math.round(focusedSecs / 60);

      if (actualMins >= 1) {
        logSession({
          duration: totalPlannedSecs / 60,
          actualCompletedMinutes: actualMins,
          startTime: sessionStartTime,
          endTime: new Date(),
          date: sessionStartTime,
          mode: 'focus',
          interrupted: true
        });
      }
    }

    clearInterval(timerRef.current);
    setIsActive(false);
    setIsPaused(false);
    const duration = getModeDuration(mode);
    setTimeLeft(duration);
    setTotalDuration(duration);
    setSessionStartTime(null);
    saveStateToLocalStorage(false, false, duration, null, mode, null);
  };

  const skipTimer = () => {
    // Log interrupted session if skipped mid-way
    if (mode === 'FOCUS' && sessionStartTime && timeLeft > 0) {
      const totalPlannedSecs = getModeDuration('FOCUS');
      const focusedSecs = totalPlannedSecs - timeLeft;
      const actualMins = Math.round(focusedSecs / 60);

      if (actualMins >= 1) {
        logSession({
          duration: totalPlannedSecs / 60,
          actualCompletedMinutes: actualMins,
          startTime: sessionStartTime,
          endTime: new Date(),
          date: sessionStartTime,
          mode: 'focus',
          interrupted: true
        });
      }
    }

    handleCompleteTime(mode, sessionStartTime?.toISOString() || new Date().toISOString());
  };

  const switchMode = (newMode) => {
    // Log interruption if switching mid-timer in FOCUS mode
    if (mode === 'FOCUS' && isActive && sessionStartTime) {
      const totalPlannedSecs = getModeDuration('FOCUS');
      const focusedSecs = totalPlannedSecs - timeLeft;
      const actualMins = Math.round(focusedSecs / 60);

      if (actualMins >= 1) {
        logSession({
          duration: totalPlannedSecs / 60,
          actualCompletedMinutes: actualMins,
          startTime: sessionStartTime,
          endTime: new Date(),
          date: sessionStartTime,
          mode: 'focus',
          interrupted: true
        });
      }
    }

    clearInterval(timerRef.current);
    setIsActive(false);
    setIsPaused(false);
    setMode(newMode);
    const duration = getModeDuration(newMode);
    setTimeLeft(duration);
    setTotalDuration(duration);
    setSessionStartTime(null);
    saveStateToLocalStorage(false, false, duration, null, newMode, null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleImmersiveFocus = () => {
    setIsImmersiveFocus(!isImmersiveFocus);
  };

  return {
    mode,
    timeLeft,
    isActive,
    isPaused,
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
  };
};

export default usePomodoro;
