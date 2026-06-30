import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Shield, Sliders, Volume2, Save, Upload } from 'lucide-react';
import './ProfileSettings.css';

const PRESET_AVATARS = [
  { id: 'avatar1', char: '🧘', label: 'Zen Master' },
  { id: 'avatar2', char: '🧠', label: 'Deep Thinker' },
  { id: 'avatar3', char: '🚀', label: 'Productivity Rocket' },
  { id: 'avatar4', char: '🐱', label: 'Focus Cat' },
  { id: 'avatar5', char: '🦉', label: 'Wise Owl' },
  { id: 'avatar6', char: '🦊', label: 'Clever Fox' },
  { id: 'avatar7', char: '⚡', label: 'Power Dynamo' },
  { id: 'avatar8', char: '🌱', label: 'Growth Mindset' },
];

const SOUND_PRESETS = [
  { id: 'digital_watch', label: 'Digital Beep', url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
  { id: 'chime', label: 'Soft Chime', url: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
  { id: 'gong', label: 'Ambient Gong', url: 'https://actions.google.com/sounds/v1/ambiences/gong.ogg' },
  { id: 'bell', label: 'Success Bell', url: 'https://actions.google.com/sounds/v1/clock/bell_chime.ogg' },
];

const ProfileSettings = () => {
  const { user, updateProfile, updateSettings } = useContext(AuthContext);
  
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('avatar1');
  
  // Settings state
  const [focusTime, setFocusTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [soundType, setSoundType] = useState('digital_watch');
  const [soundVolume, setSoundVolume] = useState(0.8);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartTimers, setAutoStartTimers] = useState(false);

  // Statuses
  const [activeTab, setActiveTab] = useState('profile');
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
  const [settingsMessage, setSettingsMessage] = useState({ text: '', type: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || 'avatar1');
      
      if (user.settings) {
        setFocusTime(user.settings.focusTime || 25);
        setShortBreakTime(user.settings.shortBreakTime || 5);
        setLongBreakTime(user.settings.longBreakTime || 15);
        setSoundType(user.settings.soundType || 'digital_watch');
        setSoundVolume(user.settings.soundVolume !== undefined ? user.settings.soundVolume : 0.8);
        setBrowserNotifications(user.settings.browserNotifications !== undefined ? user.settings.browserNotifications : true);
        setAutoStartBreaks(user.settings.autoStartBreaks || false);
        setAutoStartTimers(user.settings.autoStartTimers || false);
      }
    }
  }, [user]);

  // Handle local avatar upload
  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to 128x128 using a canvas for small base64 string
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 128, 128);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ text: '', type: '' });

    if (password && password !== confirmPassword) {
      setProfileMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsSavingProfile(true);
    const result = await updateProfile({
      name,
      email,
      avatar,
      ...(password ? { password } : {})
    });
    setIsSavingProfile(false);

    if (result.success) {
      setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } else {
      setProfileMessage({ text: result.error || 'Failed to update profile', type: 'error' });
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsMessage({ text: '', type: '' });
    setIsSavingSettings(true);

    const result = await updateSettings({
      focusTime: Number(focusTime),
      shortBreakTime: Number(shortBreakTime),
      longBreakTime: Number(longBreakTime),
      soundType,
      soundVolume: Number(soundVolume),
      browserNotifications,
      autoStartBreaks,
      autoStartTimers
    });
    setIsSavingSettings(false);

    if (result.success) {
      setSettingsMessage({ text: 'Timer and alert settings saved!', type: 'success' });
    } else {
      setSettingsMessage({ text: result.error || 'Failed to save settings', type: 'error' });
    }
  };

  const testSound = () => {
    const selected = SOUND_PRESETS.find(s => s.id === soundType);
    if (selected) {
      const audio = new Audio(selected.url);
      audio.volume = soundVolume;
      audio.play().catch(e => console.log('Audio playback blocked:', e));
    }
  };

  const renderAvatar = () => {
    if (avatar.startsWith('data:image')) {
      return <img src={avatar} alt="Custom avatar" className="avatar-preview-img" />;
    }
    const selectedPreset = PRESET_AVATARS.find(a => a.id === avatar) || PRESET_AVATARS[0];
    return <span className="avatar-preview-char">{selectedPreset.char}</span>;
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="settings-sidebar glass-panel">
        <div className="sidebar-header">
          <div className="avatar-circle">
            {renderAvatar()}
          </div>
          <h3>{name || 'User'}</h3>
          <p>{email}</p>
        </div>
        
        <div className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>Profile Details</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'timers' ? 'active' : ''}`}
            onClick={() => setActiveTab('timers')}
          >
            <Sliders size={18} />
            <span>Timer & Preferences</span>
          </button>
        </div>
      </div>

      <div className="settings-content">
        {activeTab === 'profile' && (
          <div className="settings-card glass-panel">
            <div className="card-header">
              <Shield size={22} className="header-icon" />
              <h2>Profile Configuration</h2>
            </div>
            
            {profileMessage.text && (
              <div className={`message-banner ${profileMessage.type}`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="avatar-selection-section">
                <label>Select Avatar</label>
                <div className="presets-grid">
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`preset-avatar-btn ${avatar === p.id ? 'active' : ''}`}
                      onClick={() => setAvatar(p.id)}
                      title={p.label}
                    >
                      {p.char}
                    </button>
                  ))}
                  
                  <label className="custom-upload-btn preset-avatar-btn" title="Upload Custom Photo">
                    <Upload size={20} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarFile} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Display Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary submit-btn" disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : <><Save size={18} /><span>Save Profile</span></>}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'timers' && (
          <div className="settings-card glass-panel">
            <div className="card-header">
              <Sliders size={22} className="header-icon" />
              <h2>Focus Preferences</h2>
            </div>

            {settingsMessage.text && (
              <div className={`message-banner ${settingsMessage.type}`}>
                {settingsMessage.text}
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="settings-form">
              <h3>Custom Timers (minutes)</h3>
              <div className="timings-grid">
                <div className="form-group">
                  <label>Focus Duration</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={focusTime}
                    onChange={(e) => setFocusTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Short Break</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={shortBreakTime}
                    onChange={(e) => setShortBreakTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Long Break</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={longBreakTime}
                    onChange={(e) => setLongBreakTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <h3 className="section-divider">Alert & Sound Preferences</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Alert Chime</label>
                  <div className="sound-selection-row">
                    <select
                      value={soundType}
                      onChange={(e) => setSoundType(e.target.value)}
                    >
                      {SOUND_PRESETS.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                    <button type="button" className="btn-glass sound-test-btn" onClick={testSound}>
                      <Volume2 size={16} />
                      <span>Test</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Sound Volume ({Math.round(soundVolume * 100)}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="volume-slider"
                  />
                </div>
              </div>

              <h3 className="section-divider">Automations</h3>
              <div className="toggles-grid">
                <label className="toggle-row">
                  <div className="toggle-info">
                    <span>Browser Notifications</span>
                    <p>Alert me when timer completes even in the background</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={browserNotifications}
                    onChange={(e) => setBrowserNotifications(e.target.checked)}
                    className="checkbox-toggle"
                  />
                </label>

                <label className="toggle-row">
                  <div className="toggle-info">
                    <span>Auto-start Breaks</span>
                    <p>Instantly transition to breaks without clicking play</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoStartBreaks}
                    onChange={(e) => setAutoStartBreaks(e.target.checked)}
                    className="checkbox-toggle"
                  />
                </label>

                <label className="toggle-row">
                  <div className="toggle-info">
                    <span>Auto-start Focus Sessions</span>
                    <p>Begin next focus timer automatically after breaks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoStartTimers}
                    onChange={(e) => setAutoStartTimers(e.target.checked)}
                    className="checkbox-toggle"
                  />
                </label>
              </div>

              <button type="submit" className="btn-primary submit-btn" disabled={isSavingSettings}>
                {isSavingSettings ? 'Saving...' : <><Save size={18} /><span>Save Preferences</span></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
