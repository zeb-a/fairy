import React, { useState } from 'react';
import supabaseService from '../services/supabaseService';
import './LandingPage.css';

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '' // only for signup
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        // Login logic
        result = await supabaseService.auth.signIn(formData.email, formData.password);
      } else {
        // Signup logic
        result = await supabaseService.auth.signUp(formData.email, formData.password, formData.fullName);
      }
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      // Close modal after successful auth
      setShowAuthModal(false);
      setFormData({ email: '', password: '', fullName: '' });
    } catch (err) {
      setError(err.message || err || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Lil Fairy Award</h1>
          <p className="hero-subtitle">Transform Classroom Management into a Magical Experience</p>
          <div className="hero-buttons">
            <button 
              className="cta-button primary"
              onClick={() => {
                setIsLogin(false);
                setShowAuthModal(true);
              }}
            >
              Get Started
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => {
                setIsLogin(true);
                setShowAuthModal(true);
              }}
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to transform your classroom management</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Create a Class</h3>
            <p>Set up your classroom with students and customize your teaching environment to match your unique style.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Award Stars/Reminders</h3>
            <p>Recognize good behavior and achievements with stars, or gently remind students with positive feedback.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Growth with Analytics</h3>
            <p>Monitor student progress over time and identify areas where they excel or need support.</p>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isLogin ? 'Login to Your Account' : 'Create New Account'}</h2>
              <button className="close-button" onClick={() => setShowAuthModal(false)}>×</button>
            </div>
            <form className="auth-form" onSubmit={handleAuth}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
              </button>
            </form>
            <div className="modal-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  className="toggle-auth-mode"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;