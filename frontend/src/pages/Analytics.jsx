import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  FileText,
  Send,
  CalendarDays,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { getBackendSubmissions } from "../services/formApi";

const Analytics = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);

    try {
      const data = await getBackendSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const formCounts = {};

    submissions.forEach((submission) => {
      const key =
        submission.formTitle ||
        submission.formSlug ||
        "Unknown Form";

      formCounts[key] = (formCounts[key] || 0) + 1;
    });

    const formEntries = Object.entries(formCounts).sort(
      (a, b) => b[1] - a[1]
    );

    const today = new Date();

    const todaySubmissions = submissions.filter((submission) => {
      if (!submission.createdAt) return false;

      const date = new Date(submission.createdAt);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    });

    return {
      totalSubmissions: submissions.length,

      totalForms: new Set(
        submissions.map(
          (submission) =>
            submission.formSlug ||
            submission.formTitle
        )
      ).size,

      todaySubmissions: todaySubmissions.length,

      mostSubmittedForm:
        formEntries.length > 0
          ? formEntries[0][0]
          : "No submissions yet",

      mostSubmittedCount:
        formEntries.length > 0
          ? formEntries[0][1]
          : 0,

      formEntries,
    };
  }, [submissions]);

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "1250px",
        margin: "0 auto",
        color: "#172033",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#667eea",
            }}
          >
            Analytics
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "29px",
              letterSpacing: "-0.5px",
            }}
          >
            Form Analytics
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#7a8494",
              fontSize: "14px",
            }}
          >
            Understand how your forms are performing.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            border: "1px solid #e7e9ee",
            borderRadius: "9px",
            background: "#ffffff",
            color: "#475569",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e7e9ee",
            borderRadius: "14px",
            padding: "50px",
            textAlign: "center",
            color: "#7a8494",
          }}
        >
          Loading analytics...
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <StatCard
              icon={<Send size={20} />}
              title="Total Submissions"
              value={analytics.totalSubmissions}
              background="#eef2ff"
              color="#4f46e5"
            />

            <StatCard
              icon={<FileText size={20} />}
              title="Forms With Responses"
              value={analytics.totalForms}
              background="#ecfdf5"
              color="#059669"
            />

            <StatCard
              icon={<CalendarDays size={20} />}
              title="Today's Submissions"
              value={analytics.todaySubmissions}
              background="#fff7ed"
              color="#ea580c"
            />

            <StatCard
              icon={<TrendingUp size={20} />}
              title="Most Submitted"
              value={analytics.mostSubmittedCount}
              label={analytics.mostSubmittedForm}
              background="#f5f3ff"
              color="#7c3aed"
            />
          </div>

          {/* FORM BREAKDOWN */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e7e9ee",
              borderRadius: "14px",
              padding: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
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
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChart3 size={19} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "17px",
                  }}
                >
                  Submissions by Form
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#7a8494",
                    fontSize: "13px",
                  }}
                >
                  Real submission counts from MongoDB.
                </p>
              </div>
            </div>

            {analytics.formEntries.length === 0 ? (
              <div
                style={{
                  padding: "35px 10px",
                  textAlign: "center",
                  color: "#7a8494",
                  fontSize: "14px",
                }}
              >
                No submission data available yet.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {analytics.formEntries.map(
                  ([formName, count]) => {
                    const percentage =
                      analytics.totalSubmissions > 0
                        ? (count /
                            analytics.totalSubmissions) *
                          100
                        : 0;

                    return (
                      <div key={formName}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "15px",
                            marginBottom: "7px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#334155",
                            }}
                          >
                            {formName}
                          </span>

                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#64748b",
                            }}
                          >
                            {count}
                          </span>
                        </div>

                        <div
                          style={{
                            height: "9px",
                            background: "#eef2f7",
                            borderRadius: "20px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "100%",
                              background: "#4f46e5",
                              borderRadius: "20px",
                              transition:
                                "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  label,
  background,
  color,
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e7e9ee",
        borderRadius: "13px",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        {icon}
      </div>

      <strong
        style={{
          display: "block",
          fontSize: "27px",
          color: "#172033",
        }}
      >
        {value}
      </strong>

      <span
        style={{
          display: "block",
          marginTop: "4px",
          fontSize: "13px",
          color: "#7a8494",
        }}
      >
        {title}
      </span>

      {label && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={label}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default Analytics;