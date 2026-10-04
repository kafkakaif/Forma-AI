import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  LayoutTemplate,
  Send,
  BarChart3,
  Clock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import {
  getBackendForms,
  getBackendSubmissions,
} from "../services/formApi";

import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [formsData, submissionsData] =
        await Promise.all([
          getBackendForms(),
          getBackendSubmissions(),
        ]);

      setForms(
        Array.isArray(formsData)
          ? formsData
          : []
      );

      setSubmissions(
        Array.isArray(submissionsData)
          ? submissionsData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load dashboard:",
        error
      );

      setForms([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const draftCount = useMemo(() => {
    let count = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (
          key &&
          key.startsWith("forma_draft_")
        ) {
          count++;
        }
      }
    } catch (error) {
      console.warn(
        "Unable to count drafts:",
        error
      );
    }

    return count;
  }, [forms, submissions]);

  const recentForms = useMemo(() => {
    return [...forms].slice(0, 5);
  }, [forms]);

  const recentSubmissions = useMemo(() => {
    return [...submissions]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 5);
  }, [submissions]);

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "—";
    }
  };

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">
            Dashboard
          </p>

          <h1>Welcome back</h1>

          <p className="dashboard-subtitle">
            Manage your forms and continue where
            you left off.
          </p>
        </div>

        <button
          className="create-form-btn"
          onClick={() =>
            navigate("/ai-input")
          }
        >
          <Plus size={18} />
          Create Form
        </button>
      </header>

      {/* AI INPUT */}
      <section className="ai-banner">
        <div className="ai-banner-icon">
          <Sparkles size={22} />
        </div>

        <div className="ai-banner-content">
          <h2>Start with your idea</h2>

          <p>
            Describe what you need and Forma AI
            can help structure the information
            into a form.
          </p>
        </div>

        <button
          className="ai-start-btn"
          onClick={() =>
            navigate("/ai-input")
          }
        >
          Try AI Input
          <ArrowUpRight size={16} />
        </button>
      </section>

      {/* QUICK ACTIONS */}
      <section className="dashboard-section">
        <h2>Quick Actions</h2>

        <div className="quick-actions">
          <button
            className="quick-card"
            onClick={() =>
              navigate("/ai-input")
            }
          >
            <div className="quick-icon">
              <Plus size={21} />
            </div>

            <div>
              <strong>Create a Form</strong>

              <span>
                Build a new dynamic form
              </span>
            </div>

            <ArrowUpRight size={17} />
          </button>

          <button
            className="quick-card"
            onClick={() =>
              navigate("/templates")
            }
          >
            <div className="quick-icon">
              <LayoutTemplate size={21} />
            </div>

            <div>
              <strong>Browse Templates</strong>

              <span>
                Start from an existing template
              </span>
            </div>

            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="dashboard-section">
        <div className="section-heading-row">
          <div>
            <h2>Overview</h2>

            <p>
              Real-time activity from your
              Forma AI workspace.
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="stats-container">
          <div className="dashboard-stat">
            <div className="stat-top">
              <div className="dashboard-stat-icon">
                <FileText size={19} />
              </div>
            </div>

            <strong>
              {loading ? "..." : forms.length}
            </strong>

            <span>Forms Created</span>
          </div>

          <div className="dashboard-stat">
            <div className="stat-top">
              <div className="dashboard-stat-icon">
                <Send size={19} />
              </div>
            </div>

            <strong>
              {loading
                ? "..."
                : submissions.length}
            </strong>

            <span>Submissions</span>
          </div>

          <div className="dashboard-stat">
            <div className="stat-top">
              <div className="dashboard-stat-icon">
                <Clock size={19} />
              </div>
            </div>

            <strong>
              {loading
                ? "..."
                : draftCount}
            </strong>

            <span>In Progress</span>
          </div>

          <div className="dashboard-stat">
            <div className="stat-top">
              <div className="dashboard-stat-icon">
                <BarChart3 size={19} />
              </div>
            </div>

            <strong>
              {loading
                ? "..."
                : submissions.length}
            </strong>

            <span>Responses</span>
          </div>
        </div>
      </section>

      {/* RECENT FORMS */}
      <section className="dashboard-section">
        <div className="section-heading-row">
          <div>
            <h2>Recent Forms</h2>

            <p>
              Your recently created or available
              forms.
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate("/forms")
            }
          >
            View All
            <ArrowUpRight size={15} />
          </button>
        </div>

        {loading ? (
          <div className="empty-dashboard-card">
            <div className="empty-icon">
              <FileText size={25} />
            </div>

            <h3>Loading forms...</h3>

            <p>
              Fetching your forms from the
              backend.
            </p>
          </div>
        ) : recentForms.length === 0 ? (
          <div className="empty-dashboard-card">
            <div className="empty-icon">
              <FileText size={25} />
            </div>

            <h3>No forms yet</h3>

            <p>
              Create your first form to start
              collecting structured information.
            </p>

            <button
              className="empty-create-btn"
              onClick={() =>
                navigate("/ai-input")
              }
            >
              <Plus size={16} />
              Create Form
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {recentForms.map((form) => (
              <div
                key={
                  form._id ||
                  form.slug ||
                  form.id
                }
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid #e7e9ee",
                  borderRadius: "12px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "9px",
                      background: "#eef2ff",
                      color: "#4f46e5",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <FileText
                      size={18}
                    />
                  </div>

                  <strong
                    style={{
                      fontSize: "15px",
                    }}
                  >
                    {form.title ||
                      "Untitled Form"}
                  </strong>
                </div>

                <p
                  style={{
                    margin:
                      "0 0 14px",
                    color: "#7a8494",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {form.description ||
                    "No description available."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/forms`
                    )
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color: "#4f46e5",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Open in My Forms →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT ACTIVITY */}
      <section className="dashboard-section">
        <div className="section-heading-row">
          <div>
            <h2>
              Recent Activity
            </h2>

            <p>
              Your latest submissions and
              workflow activity.
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate("/submissions")
            }
          >
            View All
            <ArrowUpRight size={15} />
          </button>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="activity-empty">
            <Clock size={20} />

            <span>
              No recent activity
            </span>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e7e9ee",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            {recentSubmissions.map(
              (submission, index) => {
                const values =
                  submission.values || {};

                const name =
                  values.fullName ||
                  values.patientName ||
                  values.ownerName ||
                  values.attendeeName ||
                  values.name ||
                  "Anonymous";

                return (
                  <div
                    key={
                      submission._id ||
                      index
                    }
                    style={{
                      padding:
                        "15px 18px",
                      borderBottom:
                        index ===
                        recentSubmissions.length -
                          1
                          ? "none"
                          : "1px solid #f0f2f5",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius:
                            "9px",
                          background:
                            "#eef2ff",
                          color:
                            "#4f46e5",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        <Send
                          size={16}
                        />
                      </div>

                      <div>
                        <strong
                          style={{
                            display:
                              "block",
                            fontSize:
                              "13px",
                          }}
                        >
                          {submission.formTitle ||
                            submission.formSlug ||
                            "Form Submission"}
                        </strong>

                        <span
                          style={{
                            color:
                              "#7a8494",
                            fontSize:
                              "12px",
                          }}
                        >
                          Submitted by{" "}
                          {name}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        color:
                          "#7a8494",
                        fontSize:
                          "12px",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {formatDate(
                        submission.createdAt
                      )}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;