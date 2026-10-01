import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Copy, FileText, CheckCircle2 } from "lucide-react";
import DynamicForm from "../components/DynamicForm";
import { getLocalForms } from "../services/formApi";
import "./GeneratedForm.css";

function GeneratedForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Retrieve schema from location state or fallback to most recent in local storage
  const schema =
    location.state?.schema ||
    (() => {
      const saved = getLocalForms();
      return saved.length > 0 ? saved[0] : null;
    })();

  const handleCopyJson = () => {
    if (!schema) return;
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!schema) {
    return (
      <div className="generated-form-page">
        <div className="generated-empty-state">
          <div className="generated-empty-icon">
            <FileText size={32} />
          </div>
          <h2>No Generated Form Found</h2>
          <p>
            You haven't generated or applied a dynamic form yet. Head over to the AI Form Generator to create one in seconds.
          </p>
          <button
            type="button"
            className="ai-generate-btn"
            onClick={() => navigate("/ai-input")}
            style={{ margin: "0 auto" }}
          >
            <Sparkles size={16} />
            Go to AI Form Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="generated-form-page">
      <div className="generated-form-topbar">
        <button
          type="button"
          className="back-to-ai-btn"
          onClick={() => navigate("/ai-input")}
        >
          <ArrowLeft size={16} />
          Back to AI Studio
        </button>

        <div className="generated-topbar-actions">
          <button
            type="button"
            className="schema-action-btn"
            onClick={handleCopyJson}
          >
            {copied ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? "Copied!" : "Copy Schema JSON"}</span>
          </button>
        </div>
      </div>

      <DynamicForm schema={schema} />
    </div>
  );
}

export default GeneratedForm;