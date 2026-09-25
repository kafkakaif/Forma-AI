import React from "react";
import {
  FileText,
  Plus,
  LayoutTemplate,
  Send,
  BarChart3,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">Dashboard</p>

          <h1>Welcome back</h1>

          <p className="dashboard-subtitle">
            Manage your forms and continue where you left off.
          </p>
        </div>

        <button className="create-form-btn">
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
            Describe what you need and Forma AI can help structure
            the information into a form.
          </p>
        </div>

        <button className="ai-start-btn">
          Try AI Input
          <ArrowUpRight size={16} />
        </button>

      </section>

      {/* QUICK ACTIONS */}

      <section className="dashboard-section">

        <h2>Quick Actions</h2>

        <div className="quick-actions">

          <button className="quick-card">

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

          <button className="quick-card">

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

        <h2>Overview</h2>

        <div className="stats-container">

          <div className="dashboard-stat">

            <div className="stat-top">
              <div className="dashboard-stat-icon">
                <FileText size={19} />
              </div>
            </div>

            <strong>—</strong>

            <span>Forms Created</span>

          </div>

          <div className="dashboard-stat">

            <div className="stat-top">
              <div className="dashboard-stat-icon">
                <Send size={19} />
              </div>
            </div>

            <strong>—</strong>

            <span>Submissions</span>

          </div>

          <div className="dashboard-stat">

            <div className="stat-top">
              <div className="dashboard-stat-icon">
                <Clock size={19} />
              </div>
            </div>

            <strong>—</strong>

            <span>In Progress</span>

          </div>

          <div className="dashboard-stat">

            <div className="stat-top">
              <div className="dashboard-stat-icon">
                <BarChart3 size={19} />
              </div>
            </div>

            <strong>—</strong>

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
              Your recently created or edited forms.
            </p>
          </div>

          <button className="view-all-btn">
            View All
            <ArrowUpRight size={15} />
          </button>

        </div>

        <div className="empty-dashboard-card">

          <div className="empty-icon">
            <FileText size={25} />
          </div>

          <h3>No forms yet</h3>

          <p>
            Create your first form to start collecting structured
            information.
          </p>

          <button className="empty-create-btn">
            <Plus size={16} />
            Create Form
          </button>

        </div>

      </section>

      {/* ACTIVITY */}

      <section className="dashboard-section">

        <div className="section-heading-row">

          <div>
            <h2>Recent Activity</h2>

            <p>
              Your latest activity will appear here.
            </p>
          </div>

        </div>

        <div className="activity-empty">

          <Clock size={20} />

          <span>
            No recent activity
          </span>

        </div>

      </section>

    </div>
  );
};

export default Dashboard;