import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DynamicForm from "../components/DynamicForm";

function GeneratedForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const schema = location.state?.schema;

  if (!schema) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>No generated form found</h2>

        <button onClick={() => navigate("/ai-input")}>
          Back to AI Input
        </button>
      </div>
    );
  }

  return (
    <div className="generated-form-page">
      <DynamicForm schema={schema} />
    </div>
  );
}

export default GeneratedForm;