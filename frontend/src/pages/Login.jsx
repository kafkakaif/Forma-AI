
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // Existing email/password login
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const storedUser = localStorage.getItem("forma_user");

      if (!storedUser) {
        setError("No account found. Please create an account first.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (
        user.email?.toLowerCase() !== email ||
        user.password !== form.password
      ) {
        setError("Invalid email or password.");
        return;
      }

      localStorage.setItem("forma_logged_in", "true");
      localStorage.setItem(
        "forma_current_user",
        JSON.stringify({
          name: user.name,
          email: user.email,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to sign in. Please try again.");
    }
  };

  // Google login: send Google's credential to the backend for verification.
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    if (!credentialResponse?.credential) {
      setError("Google did not return a credential. Please try again.");
      return;
    }

    setIsGoogleLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(
          data.message || "Google sign-in failed. Please try again."
        );
      }

      // Store only the public user details returned by the backend.
      localStorage.setItem("forma_logged_in", "true");
      localStorage.setItem(
        "forma_current_user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture || "",
        })
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);

      setError(
        err.message ||
          "Unable to sign in with Google. Check your backend server."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE */}
      <div className="auth-visual">
        <div className="auth-brand">
          <img src="/favicon.svg" alt="Forma AI Logo" className="auth-logo" />
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
            Forma AI combines intelligent extraction with dynamic forms to
            make complex workflows easier to complete.
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
            <img src="/favicon.svg" alt="Forma AI Logo" className="auth-logo" />
            <span>Forma AI</span>
          </div>

          <div className="auth-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your workspace.</p>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: 18,
                padding: "11px 13px",
                borderRadius: 9,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {/* EMAIL/PASSWORD LOGIN */}
          <form onSubmit={handleSubmit}>
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
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
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
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

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

            <button type="submit" className="auth-submit">
              Sign in
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* GOOGLE LOGIN */}
          <div
            className="google-button"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 44,
              opacity: isGoogleLoading ? 0.65 : 1,
            }}
          >
            {isGoogleLoading ? (
              <span>Signing in with Google...</span>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError("Google sign-in was unsuccessful. Please try again.");
                }}
                text="continue_with"
                shape="rectangular"
                theme="outline"
                width="320"
              />
            )}
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one</Link>
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
