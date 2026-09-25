import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
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

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!form.terms) {
      alert("Please accept the terms and conditions.");
      return;
    }

    // Frontend-only for now.
    // Backend registration will be connected later.
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
            Intelligent Workflow Platform
          </div>

          <h1>
            Build smarter forms.
            <span> Work smarter.</span>
          </h1>

          <p>
            Create, manage and complete intelligent forms with
            AI-powered assistance and dynamic workflows.
          </p>

          <div className="visual-card">

            <div className="visual-card-top">
              <div className="mini-dot"></div>
              <span>Forma AI Workspace</span>
            </div>

            <div className="assistant-message">
              Your workspace is ready for intelligent forms.
            </div>

            <div className="extraction-row">

              <div>
                <small>Dynamic forms</small>
                <strong>Enabled</strong>
              </div>

              <div>
                <small>AI assistance</small>
                <strong>Ready</strong>
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
            <h2>Create your account</h2>
            <p>
              Start building intelligent workflows with Forma AI.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* NAME */}
            <div className="form-group">

              <label htmlFor="name">
                Full name
              </label>

              <div className="input-wrapper">

                <User size={18} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

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

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              <div className="password-hint">
                Use at least 8 characters.
              </div>

            </div>

            {/* CONFIRM PASSWORD */}
            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* TERMS */}
            <div className="terms-row">

              <label>

                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                />

                <span>
                  I agree to the Terms of Service and
                  Privacy Policy.
                </span>

              </label>

            </div>

            {/* CREATE ACCOUNT */}
            <button
              type="submit"
              className="auth-submit"
            >
              Create account
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
            <span className="google-icon">
              G
            </span>

            Continue with Google
          </button>

          <p className="auth-switch">

            Already have an account?

            <Link to="/login">
              {" "}Sign in
            </Link>

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

export default Signup;