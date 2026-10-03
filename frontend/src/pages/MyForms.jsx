import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getBackendForms,
  getBackendForm,
} from "../services/formApi";

const MyForms = () => {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getBackendForms();

      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load forms:", err);
      setError("Failed to load forms.");
    } finally {
      setLoading(false);
    }
  };

  const filteredForms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return forms;
    }

    return forms.filter((form) => {
      return (
        (form.title || "")
          .toLowerCase()
          .includes(query) ||
        (form.description || "")
          .toLowerCase()
          .includes(query) ||
        (form.slug || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [forms, searchQuery]);

  const handleOpenForm = async (form) => {
    const identifier = form._id || form.slug;

    if (!identifier) {
      return;
    }

    setOpeningId(identifier);

    try {
      const result = await getBackendForm(identifier);

      if (!result?.success || !result.data) {
        alert(result?.error || "Unable to open this form.");
        return;
      }

      navigate("/generated-form", {
        state: {
          schema: result.data,
        },
      });
    } catch (err) {
      console.error("Failed to open form:", err);
      alert("Unable to open this form.");
    } finally {
      setOpeningId(null);
    }
  };

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
            My Forms
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "29px",
              letterSpacing: "-0.5px",
            }}
          >
            Your Forms
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#7a8494",
              fontSize: "14px",
            }}
          >
            View and open forms saved in Forma AI.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={loadForms}
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

          <button
            type="button"
            onClick={() => navigate("/ai-input")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              border: "none",
              borderRadius: "9px",
              background: "#4f46e5",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            <Plus size={16} />
            Create Form
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#ffffff",
          border: "1px solid #e7e9ee",
          borderRadius: "10px",
          padding: "11px 14px",
          maxWidth: "430px",
          marginBottom: "24px",
        }}
      >
        <Search size={18} color="#98a2b3" />

        <input
          type="text"
          placeholder="Search your forms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: "14px",
            color: "#172033",
          }}
        />
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            padding: "14px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e7e9ee",
            borderRadius: "14px",
            padding: "45px",
            textAlign: "center",
            color: "#7a8494",
          }}
        >
          Loading your forms...
        </div>
      ) : filteredForms.length === 0 ? (
        /* EMPTY STATE */
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e7e9ee",
            borderRadius: "14px",
            padding: "55px 25px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "14px",
              background: "#eef2ff",
              color: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <FileText size={25} />
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              color: "#172033",
            }}
          >
            {searchQuery
              ? "No matching forms found"
              : "No forms yet"}
          </h3>

          <p
            style={{
              margin: "0 auto 18px",
              maxWidth: "450px",
              color: "#7a8494",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {searchQuery
              ? "Try a different search term."
              : "Create your first dynamic form using the AI Generator."}
          </p>

          {!searchQuery && (
            <button
              type="button"
              onClick={() => navigate("/ai-input")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "9px",
                background: "#4f46e5",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              Create Your First Form
            </button>
          )}
        </div>
      ) : (
        /* FORM GRID */
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(290px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredForms.map((form) => {
            const identifier = form._id || form.slug;

            return (
              <div
                key={identifier}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e7e9ee",
                  borderRadius: "14px",
                  padding: "20px",
                  transition: "transform 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#eef2ff",
                      color: "#4f46e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={19} />
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "5px 9px",
                      borderRadius: "20px",
                      background: "#f8fafc",
                      color: "#64748b",
                      border: "1px solid #e7e9ee",
                    }}
                  >
                    v{form.version || 1}
                  </span>
                </div>

                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "17px",
                    color: "#172033",
                  }}
                >
                  {form.title || "Untitled Form"}
                </h3>

                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#7a8494",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    minHeight: "42px",
                  }}
                >
                  {form.description ||
                    "No description available."}
                </p>

                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#98a2b3",
                    fontSize: "11px",
                    wordBreak: "break-all",
                  }}
                >
                  {form.slug}
                </p>

                <button
                  type="button"
                  onClick={() => handleOpenForm(form)}
                  disabled={openingId === identifier}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    border: "none",
                    borderRadius: "9px",
                    background: "#4f46e5",
                    color: "#ffffff",
                    cursor:
                      openingId === identifier
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  {openingId === identifier
                    ? "Opening..."
                    : "Open Form"}

                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyForms;