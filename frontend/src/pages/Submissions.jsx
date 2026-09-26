import React, { useState } from "react";
import {
  Send,
  CheckCircle,
  Clock,
  Search,
  Download,
  Eye,
  X,
} from "lucide-react";

import "./Submissions.css";

const SUBMISSIONS_DATA = [
  {
    id: 1,
    formName: "Customer Feedback",
    name: "Sarah Jenkins",
    email: "sarah@vertexcloud.io",
    date: "Sep 26, 2026",
    status: "completed",
    answers: [
      { question: "Overall Experience", answer: "10 / 10 - Excellent service and very fast!" },
      { question: "Favorite Feature", answer: "Easy form creation and clean interface" },
      { question: "Suggestions for improvement", answer: "Add more dark mode options" },
    ],
  },
  {
    id: 2,
    formName: "Event Registration",
    name: "Alexander Chen",
    email: "a.chen@luminary.co",
    date: "Sep 25, 2026",
    status: "completed",
    answers: [
      { question: "Organization", answer: "Luminary Design" },
      { question: "Workshop Selected", answer: "AI & Modern Web Design Track" },
      { question: "Dietary Restrictions", answer: "Vegetarian" },
    ],
  },
  {
    id: 3,
    formName: "Job Application",
    name: "Elena Rostova",
    email: "elena.r@fintechlab.de",
    date: "Sep 25, 2026",
    status: "pending",
    answers: [
      { question: "Role Applied For", answer: "Senior Frontend Engineer" },
      { question: "Portfolio Link", answer: "https://github.com/elena-dev" },
      { question: "Years of Experience", answer: "5 years React & JavaScript" },
    ],
  },
  {
    id: 4,
    formName: "Contact & Support",
    name: "Marcus Brody",
    email: "mbrody@nexus.com",
    date: "Sep 24, 2026",
    status: "completed",
    answers: [
      { question: "Inquiry Subject", answer: "Billing & Enterprise plan question" },
      { question: "Message", answer: "Can we pay yearly via invoice transfer?" },
    ],
  },
  {
    id: 5,
    formName: "Product Survey",
    name: "Chloe Dupont",
    email: "chloe@atelier.fr",
    date: "Sep 24, 2026",
    status: "pending",
    answers: [
      { question: "Usage Frequency", answer: "Daily" },
      { question: "Most Used Feature", answer: "Templates and Export" },
      { question: "Feature Request", answer: "Export directly to Google Sheets" },
    ],
  },
];

const Submissions = () => {
  const [submissions] = useState(SUBMISSIONS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Filter submissions
  const filteredSubmissions = submissions.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const completedCount = submissions.filter((s) => s.status === "completed").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  const handleExport = () => {
    alert("Exporting submissions to CSV file...");
  };

  return (
    <div className="submissions-page">
      {/* HEADER */}
      <header className="submissions-header">
        <div>
          <p className="submissions-label">Submissions</p>
          <h1>Form Submissions</h1>
          <p className="submissions-subtitle">
            View and manage recent form responses.
          </p>
        </div>

        <button className="export-btn" onClick={handleExport}>
          <Download size={18} />
          Export CSV
        </button>
      </header>

      {/* STATS OVERVIEW */}
      <div className="submissions-stats">
        <div className="sub-stat">
          <div className="sub-stat-icon">
            <Send size={19} />
          </div>
          <strong>{submissions.length}</strong>
          <span>Total Submissions</span>
        </div>

        <div className="sub-stat">
          <div className="sub-stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
            <CheckCircle size={19} />
          </div>
          <strong>{completedCount}</strong>
          <span>Completed</span>
        </div>

        <div className="sub-stat">
          <div className="sub-stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
            <Clock size={19} />
          </div>
          <strong>{pendingCount}</strong>
          <span>Pending Review</span>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="submissions-controls">
        <div className="sub-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or form..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* SUBMISSIONS TABLE */}
      <div className="submissions-table-card">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Form Name</th>
              <th>Submitted By</th>
              <th>Email</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#7a8494" }}>
                  No submissions found matching your search.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <strong>{sub.formName}</strong>
                  </td>
                  <td>{sub.name}</td>
                  <td style={{ color: "#64748b" }}>{sub.email}</td>
                  <td style={{ color: "#64748b" }}>{sub.date}</td>
                  <td>
                    <span className={`status-badge ${sub.status}`}>
                      {sub.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn-view"
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SIMPLE DETAILS MODAL */}
      {selectedSubmission && (
        <div
          className="details-modal-overlay"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="details-modal-header">
              <h3>Submission Details</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedSubmission(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="details-modal-body">
              <div className="respondent-card">
                <div className="respondent-card-row">
                  <span>Form:</span>
                  <strong>{selectedSubmission.formName}</strong>
                </div>
                <div className="respondent-card-row">
                  <span>Name:</span>
                  <strong>{selectedSubmission.name}</strong>
                </div>
                <div className="respondent-card-row">
                  <span>Email:</span>
                  <strong>{selectedSubmission.email}</strong>
                </div>
                <div className="respondent-card-row">
                  <span>Date:</span>
                  <strong>{selectedSubmission.date}</strong>
                </div>
              </div>

              <div className="answers-list-title">Submitted Answers:</div>
              {selectedSubmission.answers.map((item, idx) => (
                <div key={idx} className="answer-item">
                  <div className="answer-item-question">{item.question}</div>
                  <div className="answer-item-value">{item.answer}</div>
                </div>
              ))}
            </div>

            <div className="details-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;