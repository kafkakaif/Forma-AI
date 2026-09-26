import React, { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Calendar,
  Mail,
  Users,
  CheckSquare,
  Sparkles,
  Clock,
  X,
} from "lucide-react";

import "./Templates.css";

const TEMPLATES = [
  {
    id: 1,
    title: "Customer Feedback",
    description: "Collect honest ratings, reviews, and satisfaction feedback from your clients.",
    category: "Feedback",
    questions: 5,
    time: "2 min",
    icon: FileText,
    sampleQuestions: [
      "How would you rate your overall experience?",
      "What features do you like the most?",
      "What can we do to improve?",
    ],
  },
  {
    id: 2,
    title: "Event Registration",
    description: "Streamline RSVP registration, attendee info, and ticket preferences.",
    category: "Registration",
    questions: 6,
    time: "3 min",
    icon: Calendar,
    sampleQuestions: [
      "Full Name & Organization",
      "Which workshop session will you attend?",
      "Any dietary restrictions?",
    ],
  },
  {
    id: 3,
    title: "Contact & Support",
    description: "Simple inquiry and support request intake form for your website.",
    category: "Contact",
    questions: 4,
    time: "1 min",
    icon: Mail,
    sampleQuestions: [
      "Your Name and Email Address",
      "Subject of inquiry",
      "How can our team help you today?",
    ],
  },
  {
    id: 4,
    title: "Job Application",
    description: "Collect applicant details, resume links, and role qualifications.",
    category: "HR",
    questions: 8,
    time: "5 min",
    icon: Users,
    sampleQuestions: [
      "Candidate Name and Contact Info",
      "Link to Portfolio or LinkedIn",
      "Years of relevant work experience",
    ],
  },
  {
    id: 5,
    title: "Product Survey",
    description: "Understand user needs, desired features, and pain points.",
    category: "Surveys",
    questions: 6,
    time: "3 min",
    icon: CheckSquare,
    sampleQuestions: [
      "How often do you use our product?",
      "Which tool do you use the most?",
      "What new capability would you like next?",
    ],
  },
  {
    id: 6,
    title: "Newsletter Signup",
    description: "Fast, 1-step subscription form to grow your audience and email list.",
    category: "Registration",
    questions: 3,
    time: "1 min",
    icon: Sparkles,
    sampleQuestions: [
      "Your Email Address",
      "Topics you are interested in",
    ],
  },
];

const CATEGORIES = ["All", "Feedback", "Registration", "Contact", "HR", "Surveys"];

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Filter templates based on search and category
  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || tpl.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (tpl) => {
    alert(`Started new form using "${tpl.title}"!`);
    setPreviewTemplate(null);
  };

  return (
    <div className="templates-page">
      {/* HEADER */}
      <header className="templates-header">
        <div>
          <p className="templates-label">Templates</p>
          <h1>Form Templates</h1>
          <p className="templates-subtitle">
            Choose a ready-to-use template or start from scratch.
          </p>
        </div>

        <button
          className="create-btn"
          onClick={() => alert("Creating blank form...")}
        >
          <Plus size={18} />
          Blank Form
        </button>
      </header>

      {/* SEARCH & CATEGORY BAR */}
      <div className="templates-filter-bar">
        <div className="search-input-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TEMPLATES GRID */}
      <div className="templates-grid">
        {filteredTemplates.map((tpl) => {
          const Icon = tpl.icon;

          return (
            <div key={tpl.id} className="template-card">
              <div className="card-top">
                <div className="template-icon">
                  <Icon size={20} />
                </div>
                <span className="card-badge">{tpl.category}</span>
              </div>

              <h3>{tpl.title}</h3>
              <p>{tpl.description}</p>

              <div className="card-meta">
                <div className="meta-item">
                  <FileText size={14} />
                  <span>{tpl.questions} questions</span>
                </div>
                <div className="meta-item">
                  <Clock size={14} />
                  <span>{tpl.time}</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-preview"
                  onClick={() => setPreviewTemplate(tpl)}
                >
                  Preview
                </button>
                <button
                  className="btn-use"
                  onClick={() => handleUseTemplate(tpl)}
                >
                  Use Template
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SIMPLE PREVIEW MODAL */}
      {previewTemplate && (
        <div
          className="simple-modal-overlay"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="simple-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h3>{previewTemplate.title} Preview</h3>
              <button
                className="close-btn"
                onClick={() => setPreviewTemplate(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="simple-modal-body">
              <p className="modal-desc">{previewTemplate.description}</p>

              <div className="preview-questions-title">Sample Questions:</div>
              <div className="preview-questions-list">
                {previewTemplate.sampleQuestions.map((q, idx) => (
                  <div key={idx} className="preview-q-item">
                    {idx + 1}. {q}
                  </div>
                ))}
              </div>
            </div>

            <div className="simple-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </button>
              <button
                className="btn-use"
                onClick={() => handleUseTemplate(previewTemplate)}
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;