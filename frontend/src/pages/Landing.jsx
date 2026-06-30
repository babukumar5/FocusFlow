import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Calendar, Target, Clock, Sparkles } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: <Clock className="feature-icon" />, title: 'Spatial Pomodoro Timer', desc: 'Customizable focus intervals (25/5, 50/10, or custom) with SVG progress animation.' },
  { icon: <Target className="feature-icon" />, title: 'Interactive Kanban Board', desc: 'Sort your priorities with zero friction using native drag-and-drop task status columns.' },
  { icon: <BarChart2 className="feature-icon" />, title: 'Deep Analytics', desc: 'Visualize focus logs using premium Recharts areas, filtered by daily, weekly, or monthly periods.' },
  { icon: <Calendar className="feature-icon" />, title: 'Streaks & Schedulers', desc: 'Build compounding habits and schedule tasks onto days with an integrated agenda calendar.' }
];

const Landing = () => {
  return (
    <div className="landing-container animate-fade-in">
      {/* Decorative Blur Spheres */}
      <div className="landing-glows">
        <div className="landing-glow-1"></div>
        <div className="landing-glow-2"></div>
      </div>

      <section className="hero-section glass-panel">
        <div className="badge-wrapper">
          <span className="premium-badge"><Sparkles size={12} /> Apple Vision Pro Inspired Theme</span>
        </div>
        <h1 className="hero-title">Master Your Time with <span className="highlight">FocusFlow</span></h1>
        <p className="hero-subtitle">
          The ultimate minimal productivity environment designed for deep flow states. Organize, schedule, and execute your work with frosted spatial interfaces.
        </p>
        <div className="hero-cta">
          <Link to="/signup" className="btn-primary btn-large">Get Started for Free</Link>
          <Link to="/login" className="btn-glass btn-large">Login to Account</Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Fully integrated productivity dashboard</h2>
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
