import React, { useState } from "react";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  KeyRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [step, setStep] = useState("email");
  const [error, setError] = useState("");

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    try {
      const storedUser =
        localStorage.getItem(
          "forma_user"
        );

      if (!storedUser) {
        setError(
          "No account exists yet. Please create an account first."
        );
        return;
      }

      const user = JSON.parse(
        storedUser
      );

      if (
        user.email?.toLowerCase() !==
        normalizedEmail
      ) {
        setError(
          "No account was found with this email address."
        );
        return;
      }

      setEmail(normalizedEmail);
      setStep("password");
    } catch (error) {
      console.error(
        "Password recovery error:",
        error
      );

      setError(
        "Unable to verify the account."
      );
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      const storedUser =
        localStorage.getItem(
          "forma_user"
        );

      if (!storedUser) {
        setError(
          "Account information could not be found."
        );
        return;
      }

      const user = JSON.parse(
        storedUser
      );

      localStorage.setItem(
        "forma_user",
        JSON.stringify({
          ...user,
          password: newPassword,
        })
      );

      localStorage.removeItem(
        "forma_logged_in"
      );

      setStep("success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Password reset error:",
        error
      );

      setError(
        "Unable to reset the password."
      );
    }
  };

  const resetFlow = () => {
    setStep("email");
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-visual">

        <div className="auth-brand">
          <div className="auth-logo">
            F
          </div>

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
            Recover access to your Forma AI
            workspace and continue working
            with your intelligent workflows.
          </p>

          <div className="visual-card">

            <div className="visual-card-top">
              <div className="mini-dot"></div>

              <span>
                Account Recovery
              </span>
            </div>

            <div className="assistant-message">
              Reset your password securely
              and continue using Forma AI.
            </div>

            <div className="extraction-row">

              <div>
                <small>
                  Secure recovery
                </small>

                <strong>
                  Enabled
                </strong>
              </div>

              <div>
                <small>
                  Verification
                </small>

                <strong>
                  Required
                </strong>
              </div>

            </div>

          </div>

        </div>

        <div className="visual-footer">
          Intelligent workflows · Dynamic forms ·
          AI assistance
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="auth-form-section">

        <div className="auth-form-container">

          <div className="mobile-brand">
            <div className="auth-logo">
              F
            </div>

            <span>Forma AI</span>
          </div>

          {/* STEP 1 */}
          {step === "email" && (
            <>
              <div className="auth-heading">

                <h2>
                  Forgot your password?
                </h2>

                <p>
                  Enter your registered email
                  to continue.
                </p>

              </div>

              {error && (
                <div
                  style={{
                    marginBottom: 18,
                    padding:
                      "11px 13px",
                    borderRadius: 9,
                    background:
                      "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color:
                      "#b91c1c",
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={
                  handleEmailSubmit
                }
              >

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
                      onChange={(e) => {
                        setEmail(
                          e.target.value
                        );
                        setError("");
                      }}
                      required
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  className="auth-submit"
                >
                  Continue
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
          )}

          {/* STEP 2 */}
          {step === "password" && (
            <>
              <div className="auth-heading">

                <h2>
                  Create a new password
                </h2>

                <p>
                  Set a new password for{" "}
                  <strong>
                    {email}
                  </strong>
                </p>

              </div>

              {error && (
                <div
                  style={{
                    marginBottom: 18,
                    padding:
                      "11px 13px",
                    borderRadius: 9,
                    background:
                      "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color:
                      "#b91c1c",
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={
                  handlePasswordReset
                }
              >

                <div className="form-group">

                  <label htmlFor="newPassword">
                    New password
                  </label>

                  <div className="input-wrapper">

                    <KeyRound size={18} />

                    <input
                      id="newPassword"
                      type="password"
                      placeholder="Create a new password"
                      value={
                        newPassword
                      }
                      onChange={(e) => {
                        setNewPassword(
                          e.target.value
                        );
                        setError("");
                      }}
                      minLength={8}
                      required
                    />

                  </div>

                  <div className="password-hint">
                    Use at least 8 characters.
                  </div>

                </div>

                <div className="form-group">

                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <div className="input-wrapper">

                    <Lock size={18} />

                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={
                        confirmPassword
                      }
                      onChange={(e) => {
                        setConfirmPassword(
                          e.target.value
                        );
                        setError("");
                      }}
                      required
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  className="auth-submit"
                >
                  Reset Password
                  <ArrowRight size={18} />
                </button>

              </form>

              <div className="back-login">

                <button
                  type="button"
                  onClick={resetFlow}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color: "#4f46e5",
                    cursor: "pointer",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: 6,
                    fontSize: 14,
                  }}
                >
                  <ArrowLeft size={15} />
                  Use another email
                </button>

              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === "success" && (
            <div className="success-state">

              <div className="success-icon">
                <CheckCircle2 size={38} />
              </div>

              <h2>
                Password updated
              </h2>

              <p>
                Your password has been reset
                successfully. You can now
                sign in with your new password.
              </p>

              <button
                className="auth-submit"
                onClick={() =>
                  navigate("/login")
                }
              >
                Go to Login
                <ArrowRight size={18} />
              </button>

            </div>
          )}

          <div className="auth-security">

            <Lock size={14} />

            Your information is securely
            protected.

          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;