import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Sliders,
  BarChart3,
  CheckCircle,
  Menu,
  X,
  Send,
} from "lucide-react";

import "./Landing.css";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("forma_logged_in") === "true";

  // Hero interactive preview state
  const [selectedRating, setSelectedRating] = useState(5);
  const [selectedFeature, setSelectedFeature] = useState("AI Form Generator");

  return (
    <div className="simple-landing">
      {/* ========================================================
          STICKY NAVBAR (WITH SIGN IN & SIGN UP)
      ========================================================= */}
      <header className="simple-navbar">
        <div className="navbar-inner">
          {/* BRAND */}
          <Link to="/" className="brand-link">
            <img src="/favicon.svg" alt="Forma AI Logo" className="brand-icon" />
            <span className="brand-name">Forma AI</span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#cta">Get Started</a>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="nav-actions">
            {isLoggedIn && (
              <Link to="/dashboard" className="btn-dashboard">
                Dashboard
              </Link>
            )}

            {/* SIGN IN BUTTON */}
            <Link to="/login" className="btn-signin" id="nav-signin-btn">
              Sign In
            </Link>

            {/* SIGN UP BUTTON */}
            <Link to="/signup" className="btn-signup" id="nav-signup-btn">
              Sign Up
              <ArrowRight size={15} />
            </Link>

            {/* MOBILE MENU TOGGLE */}
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <div className="mobile-auth-buttons">
              <Link
                to="/login"
                className="mobile-btn-signin"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="mobile-btn-signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up Free
              </Link>
              {isLoggedIn && (
                <Link
                  to="/dashboard"
                  className="mobile-btn-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          HERO SECTION (IMPROVED & MODERN)
      ========================================================= */}
      <section className="hero">
        {/* AMBIENT BACKGROUND GLOWS */}
        <div className="hero-glow hero-glow-left"></div>
        <div className="hero-glow hero-glow-right"></div>
        <div className="hero-grid-bg"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            <Sparkles size={14} className="badge-sparkle" />
            <span>Forma AI 2.0 • Next-Gen Form Builder</span>
          </div>

          <h1 className="hero-heading">
            Build Intelligent Forms at the{" "}
            <span className="gradient-text">Speed of Thought</span>
          </h1>

          <p className="hero-subtext">
            Transform plain words into high-converting, multi-step forms,
            surveys, and workflows in seconds. No manual drag-and-drop fatigue.
          </p>

          {/* HERO CALL-TO-ACTIONS */}
          <div className="hero-buttons">
            <Link to="/signup" className="btn-hero-primary" id="hero-signup-btn">
              <Sparkles size={18} />
              <span>Get Started Free</span>
              <ArrowRight size={17} />
            </Link>

            <Link to="/login" className="btn-hero-secondary" id="hero-signin-btn">
              <span>Sign In to Workspace</span>
            </Link>
          </div>

          <div className="hero-trust-list">
            <span>✓ No credit card required</span>
            <span>✓ Instant AI generation</span>
            <span>✓ 100% mobile-optimized</span>
          </div>
        </div>

        {/* ENHANCED PRODUCT PREVIEW CARD WITH FLOATING ACCENTS */}
        <div className="hero-preview-wrapper">
          {/* FLOATING BADGE LEFT */}
          <div className="floating-badge badge-left">
            <div className="floating-badge-icon icon-green">⚡</div>
            <div>
              <strong>3.4x Faster</strong>
              <small>completion rate</small>
            </div>
          </div>

          {/* FLOATING BADGE RIGHT */}
          <div className="floating-badge badge-right">
            <div className="floating-badge-icon icon-purple">✦</div>
            <div>
              <strong>AI Synthesized</strong>
              <small>in 0.8 seconds</small>
            </div>
          </div>

          <div className="preview-window">
            <div className="preview-top">
              <div className="dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <span className="preview-title">Forma AI — Interactive Form Preview</span>
              <span className="preview-live-tag">LIVE DEMO</span>
            </div>

            <div className="preview-body">
              {/* PROMPT BANNER */}
              <div className="preview-prompt-bar">
                <div className="prompt-label-wrap">
                  <Sparkles size={15} className="prompt-sparkle" />
                  <span className="prompt-label">Prompt:</span>
                </div>
                <span className="prompt-text">
                  "Create a customer satisfaction survey with rating scale and feature feedback"
                </span>
              </div>

              {/* MOCK FORM WITH INTERACTION */}
              <div className="preview-mock-form">
                {/* PROGRESS BAR */}
                <div className="preview-progress-row">
                  <span className="progress-text">Step 1 of 2 • Overall Experience</span>
                  <span className="progress-pct">50%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill"></div>
                </div>

                {/* QUESTION 1: STAR RATING */}
                <div className="mock-field">
                  <label>1. How satisfied are you with Forma AI?</label>
                  <div className="interactive-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-pill ${selectedRating >= star ? "active" : ""}`}
                        onClick={() => setSelectedRating(star)}
                        title={`Rate ${star} stars`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="star-feedback">
                      {selectedRating === 5 && "Outstanding! 😍"}
                      {selectedRating === 4 && "Great experience! 😊"}
                      {selectedRating === 3 && "Average 😐"}
                      {selectedRating <= 2 && "Needs improvement 🙁"}
                    </span>
                  </div>
                </div>

                {/* QUESTION 2: PILL CHOICES */}
                <div className="mock-field">
                  <label>2. What is your favorite capability?</label>
                  <div className="interactive-chips">
                    {[
                      "AI Form Generator",
                      "Dynamic Logic",
                      "Real-Time Analytics",
                      "Instant Export",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`chip-choice ${selectedFeature === opt ? "selected" : ""}`}
                        onClick={() => setSelectedFeature(opt)}
                      >
                        {selectedFeature === opt ? "✓ " : ""}{opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QUESTION 3: TEXTAREA */}
                <div className="mock-field">
                  <label>3. What could we do even better?</label>
                  <div className="mock-input-box">
                    <span>The AI generated schema is remarkably fast and clean...</span>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="mock-footer">
                  <Link to="/signup" className="mock-submit">
                    <span>Try It Yourself (Sign Up Free)</span>
                    <ArrowRight size={15} />
                  </Link>
                  <span className="security-tag">🔒 End-to-end encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SIMPLE 3-FEATURE HIGHLIGHT
      ========================================================= */}
      <section className="features" id="features">
        <div className="features-header">
          <h2>Why Forma AI?</h2>
          <p>Everything you need to gather data smarter and faster.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-zap">
              <Zap size={22} />
            </div>
            <h3>Instant AI Generation</h3>
            <p>
              Type what information you need to collect. Forma AI creates
              questions, formats, and validations in seconds.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-sliders">
              <Sliders size={22} />
            </div>
            <h3>Dynamic & Customizable</h3>
            <p>
              Fine-tune questions, customize color schemes, and reorder fields
              with a modern, intuitive editor.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-chart">
              <BarChart3 size={22} />
            </div>
            <h3>Real-Time Analytics</h3>
            <p>
              Track submissions instantly, view completion rates, and export your
              collected responses easily.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          SIMPLE 3-STEP GUIDE
      ========================================================= */}
      <section className="how-it-works" id="how-it-works">
        <div className="features-header">
          <h2>How It Works</h2>
          <p>Get up and running in three simple steps.</p>
        </div>

        <div className="steps-row">
          <div className="step-item">
            <div className="step-num">1</div>
            <h4>Describe Your Form</h4>
            <p>Type a short description or pick from ready-made templates.</p>
          </div>

          <div className="step-item">
            <div className="step-num">2</div>
            <h4>Review & Edit</h4>
            <p>Customize your fields, options, and validations in real time.</p>
          </div>

          <div className="step-item">
            <div className="step-num">3</div>
            <h4>Share & Collect</h4>
            <p>Publish a shareable link and start receiving submissions instantly.</p>
          </div>
        </div>
      </section>

      {/* ========================================================
          SIMPLE BOTTOM CTA
      ========================================================= */}
      <section className="cta-banner" id="cta">
        <div className="cta-box">
          <h2>Start Building Forms with Forma AI</h2>
          <p>Join today to experience fast, intelligent form building.</p>

          <div className="cta-action-buttons">
            <Link to="/signup" className="btn-cta-signup">
              <span>Sign Up Free</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/login" className="btn-cta-signin">
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          SIMPLE FOOTER
      ========================================================= */}
      <footer className="simple-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-brand">
              <img src="/favicon.svg" alt="Forma AI Logo" className="footer-logo" />
              <span>Forma AI</span>
            </div>
            <p>© {new Date().getFullYear()} Forma AI. All rights reserved.</p>
          </div>

          <div className="footer-links">
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
