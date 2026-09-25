import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  localStorage.setItem("forma_logged_in", "true");

  navigate("/dashboard");
};
  return (
    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-visual">

        <div className="auth-brand">
          <div className="auth-logo">F</div>
          <span>Forma AI</span>
        </div>

        <div className="visual-content">
          <div className="ai-badge">
            <Sparkles size={15} />
            AI-Augmented Forms
          </div>

          <h1>
            Turn complex forms into
            <span> simple experiences.</span>
          </h1>

          <p>
            Forma AI combines intelligent extraction with dynamic forms
            to make complex workflows easier to complete.
          </p>

          <div className="visual-card">
            <div className="visual-card-top">
              <div className="mini-dot"></div>
              <span>AI Form Assistant</span>
            </div>

            <div className="assistant-message">
              Tell us what happened in your own words.
            </div>

            <div className="assistant-input">
              <span>Describe your incident...</span>
              <div className="input-arrow">
                <ArrowRight size={15} />
              </div>
            </div>

            <div className="extraction-row">
              <div>
                <small>AI extracted</small>
                <strong>3 fields</strong>
              </div>

              <div>
                <small>Questions remaining</small>
                <strong>4</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="visual-footer">
          Intelligent workflows · Dynamic forms · AI assistance
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-form-section">

        <div className="auth-form-container">

          <div className="mobile-brand">
            <div className="auth-logo">F</div>
            <span>Forma AI</span>
          </div>

          <div className="auth-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* REMEMBER */}
            <div className="remember-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* BUTTON */}
            <button type="submit" className="auth-submit">
              Sign in
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-button"
          >
            <span className="google-icon">G</span>
            Continue with Google
          </button>

          <p className="auth-switch">
            Don't have an account?
            <Link to="/signup"> Create one</Link>
          </p>

          <div className="auth-security">
            <Lock size={14} />
            Your information is securely protected.
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;