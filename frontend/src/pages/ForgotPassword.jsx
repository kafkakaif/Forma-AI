import React, { useState } from "react";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Frontend-only for now.
    // Real password reset will be connected during backend development.
    setSubmitted(true);
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
            <Lock size={15} />
            Account Security
          </div>

          <h1>
            Keep your account
            <span> secure.</span>
          </h1>

          <p>
            Recover access to your Forma AI workspace and
            continue working with your intelligent workflows.
          </p>

          <div className="visual-card">

            <div className="visual-card-top">
              <div className="mini-dot"></div>
              <span>Account Recovery</span>
            </div>

            <div className="assistant-message">
              Enter your registered email address to begin
              the recovery process.
            </div>

            <div className="extraction-row">

              <div>
                <small>Secure recovery</small>
                <strong>Enabled</strong>
              </div>

              <div>
                <small>Verification</small>
                <strong>Required</strong>
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

          {!submitted ? (

            <>
              <div className="auth-heading">

                <h2>Forgot your password?</h2>

                <p>
                  Enter your email and we'll help you
                  recover your account.
                </p>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="form-group">

                  <label htmlFor="email">
                    Email address
                  </label>

                  <div className="input-wrapper">

                    <Mail size={18} />

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  className="auth-submit"
                >
                  Send reset link
                  <ArrowRight size={18} />
                </button>

              </form>

              <div className="back-login">

                <Link to="/login">
                  <ArrowLeft size={15} />
                  Back to login
                </Link>

              </div>

            </>

          ) : (

            <div className="success-state">

              <div className="success-icon">
                <CheckCircle2 size={38} />
              </div>

              <h2>Check your email</h2>

              <p>
                If an account exists for
                <strong> {email}</strong>, you will receive
                instructions to reset your password.
              </p>

              <button
                className="auth-submit"
                onClick={() => setSubmitted(false)}
              >
                Try another email
              </button>

              <div className="back-login">

                <Link to="/login">
                  <ArrowLeft size={15} />
                  Back to login
                </Link>

              </div>

            </div>

          )}

          <div className="auth-security">

            <Lock size={14} />

            Your information is securely protected.

          </div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;