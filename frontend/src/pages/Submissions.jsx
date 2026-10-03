import React, { useEffect, useMemo, useState } from "react";
import {
  Send,
  CheckCircle,
  Search,
  Download,
  Eye,
  X,
} from "lucide-react";

import { getBackendSubmissions } from "../services/formApi";
import "./Submissions.css";

const getDisplayName = (values = {}) => {
  return (
    values.fullName ||
    values.patientName ||
    values.ownerName ||
    values.attendeeName ||
    values.name ||
    values.userName ||
    "Anonymous"
  );
};

const getEmail = (values = {}) => {
  return values.email || values.contactEmail || "—";
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatAnswer = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getBackendSubmissions();

      const normalized = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            formName:
              item.formTitle ||
              item.formSlug ||
              "Untitled Form",

            name: getDisplayName(item.values),

            email: getEmail(item.values),

            date: formatDate(item.createdAt),

            status: "completed",
          }))
        : [];

      setSubmissions(normalized);
    } catch (err) {
      console.error("Failed to load submissions:", err);
      setError("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return submissions;
    }

    return submissions.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.formName.toLowerCase().includes(query)
      );
    });
  }, [submissions, searchQuery]);

  const completedCount = submissions.length;

  const handleExport = () => {
    if (submissions.length === 0) {
      alert("No submissions available to export.");
      return;
    }

    const rows = submissions.map((item) => ({
      "Form Name": item.formName,
      "Submitted By": item.name,
      Email: item.email,
      Date: item.date,
      Status: item.status,
      "Submission ID": item._id || item.id || "",
    }));

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header] ?? "").replace(/"/g, '""');
            return `"${value}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "forma-ai-submissions.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
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

        <button
          className="export-btn"
          onClick={handleExport}
        >
          <Download size={18} />
          Export CSV
        </button>
      </header>

      {/* STATS */}
      <div className="submissions-stats">
        <div className="sub-stat">
          <div className="sub-stat-icon">
            <Send size={19} />
          </div>

          <strong>{submissions.length}</strong>

          <span>Total Submissions</span>
        </div>

        <div className="sub-stat">
          <div
            className="sub-stat-icon"
            style={{
              background: "#ecfdf5",
              color: "#059669",
            }}
          >
            <CheckCircle size={19} />
          </div>

          <strong>{completedCount}</strong>

          <span>Completed</span>
        </div>

        <div className="sub-stat">
          <div
            className="sub-stat-icon"
            style={{
              background: "#f4f5ff",
              color: "#5146e5",
            }}
          >
            <Send size={19} />
          </div>

          <strong>
            {
              new Set(
                submissions.map((item) => item.formSlug)
              ).size
            }
          </strong>

          <span>Forms With Responses</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="submissions-controls">
        <div className="sub-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email, or form..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            padding: "14px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="submissions-table-card">
        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#7a8494",
            }}
          >
            Loading submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#7a8494",
            }}
          >
            {searchQuery
              ? "No submissions found matching your search."
              : "No submissions found."}
          </div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>Form Name</th>
                <th>Submitted By</th>
                <th>Email</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSubmissions.map((sub) => (
                <tr key={sub._id}>
                  <td>
                    <strong>{sub.formName}</strong>
                  </td>

                  <td>{sub.name}</td>

                  <td style={{ color: "#64748b" }}>
                    {sub.email}
                  </td>

                  <td style={{ color: "#64748b" }}>
                    {sub.date}
                  </td>

                  <td>
                    <span className="status-badge completed">
                      Completed
                    </span>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn-view"
                      onClick={() =>
                        setSelectedSubmission(sub)
                      }
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedSubmission && (
        <div
          className="details-modal-overlay"
          onClick={() =>
            setSelectedSubmission(null)
          }
        >
          <div
            className="details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="details-modal-header">
              <h3>Submission Details</h3>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedSubmission(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="details-modal-body">
              <div className="respondent-card">
                <div className="respondent-card-row">
                  <span>Form:</span>

                  <strong>
                    {selectedSubmission.formName}
                  </strong>
                </div>

                <div className="respondent-card-row">
                  <span>Name:</span>

                  <strong>
                    {selectedSubmission.name}
                  </strong>
                </div>

                <div className="respondent-card-row">
                  <span>Email:</span>

                  <strong>
                    {selectedSubmission.email}
                  </strong>
                </div>

                <div className="respondent-card-row">
                  <span>Date:</span>

                  <strong>
                    {selectedSubmission.date}
                  </strong>
                </div>
              </div>

              <div className="answers-list-title">
                Submitted Answers:
              </div>

              {selectedSubmission.values &&
              Object.keys(selectedSubmission.values)
                .length > 0 ? (
                Object.entries(
                  selectedSubmission.values
                ).map(([key, value]) => (
                  <div
                    key={key}
                    className="answer-item"
                  >
                    <div className="answer-item-question">
                      {key}
                    </div>

                    <div className="answer-item-value">
                      {formatAnswer(value)}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    color: "#7a8494",
                    fontSize: "14px",
                  }}
                >
                  No submitted values available.
                </div>
              )}
            </div>

            <div className="details-modal-footer">
              <button
                className="btn-secondary"
                onClick={() =>
                  setSelectedSubmission(null)
                }
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