import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, BarChart2, Calendar, Target } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: <CheckCircle className="feature-icon" />, title: 'Smart Pomodoro Timer', desc: 'Customizable focus sessions with seamless break transitions.' },
  { icon: <Target className="feature-icon" />, title: 'Task Management', desc: 'Organize your day with priority tags, subtasks, and categories.' },
  { icon: <BarChart2 className="feature-icon" />, title: 'Productivity Analytics', desc: 'Track your focus time, view charts, and monitor your streaks.' },
  { icon: <Calendar className="feature-icon" />, title: 'Daily Journal & Habits', desc: 'Reflect on your day and build lasting habits with our integrated tracker.' }
];

const Landing = () => {
  return (
    <div className="landing-container">
      <section className="hero-section glass-panel">
        <h1 className="hero-title">Master Your Time with <span className="highlight">FocusFlow</span></h1>
        <p className="hero-subtitle">
          The ultimate productivity suite designed for deep work. Experience an elegant, distraction-free environment to accomplish your goals.
        </p>
        <div className="hero-cta">
          <Link to="/signup" className="btn-primary btn-large">Get Started for Free</Link>
          <Link to="/login" className="btn-glass btn-large">Login to Account</Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Everything you need to stay focused</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass-panel">
              <div className="feature-icon-wrapper">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
