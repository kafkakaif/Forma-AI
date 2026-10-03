import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

import { saveFormToBackend } from "../services/formApi";
import "./Templates.css";

const TEMPLATES = [
  {
    id: "customer-feedback",
    title: "Customer Feedback",
    description:
      "Collect honest ratings, reviews, and satisfaction feedback from your clients.",
    category: "Feedback",
    questions: 5,
    time: "2 min",
    icon: FileText,

    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Enter your full name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },
      {
        id: "rating",
        label: "Overall Experience",
        type: "select",
        required: true,
        options: [
          { label: "1 - Very Poor", value: "1" },
          { label: "2 - Poor", value: "2" },
          { label: "3 - Average", value: "3" },
          { label: "4 - Good", value: "4" },
          { label: "5 - Excellent", value: "5" },
        ],
      },
      {
        id: "favoriteFeature",
        label: "Favorite Feature",
        type: "text",
        required: false,
        placeholder: "What did you like the most?",
      },
      {
        id: "suggestions",
        label: "Suggestions for Improvement",
        type: "textarea",
        required: false,
        placeholder: "Tell us how we can improve...",
      },
    ],

    sampleQuestions: [
      "How would you rate your overall experience?",
      "What features do you like the most?",
      "What can we do to improve?",
    ],
  },

  {
    id: "event-registration",
    title: "Event Registration",
    description:
      "Streamline RSVP registration, attendee information, and ticket preferences.",
    category: "Registration",
    questions: 6,
    time: "3 min",
    icon: Calendar,

    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Enter your full name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },
      {
        id: "organization",
        label: "Organization",
        type: "text",
        required: false,
        placeholder: "Company or organization",
      },
      {
        id: "ticketType",
        label: "Ticket Type",
        type: "select",
        required: true,
        options: [
          { label: "General Admission", value: "general" },
          { label: "VIP", value: "vip" },
          { label: "Student", value: "student" },
        ],
      },
      {
        id: "dietaryRestrictions",
        label: "Dietary Restrictions",
        type: "select",
        required: false,
        options: [
          { label: "None", value: "none" },
          { label: "Vegetarian", value: "vegetarian" },
          { label: "Vegan", value: "vegan" },
          { label: "Other", value: "other" },
        ],
      },
      {
        id: "specialRequests",
        label: "Special Requests",
        type: "textarea",
        required: false,
        placeholder: "Any additional requests...",
      },
    ],

    sampleQuestions: [
      "Full Name & Organization",
      "Which ticket type will you choose?",
      "Any dietary restrictions?",
    ],
  },

  {
    id: "contact-support",
    title: "Contact & Support",
    description:
      "Simple inquiry and support request intake form for your website.",
    category: "Contact",
    questions: 4,
    time: "1 min",
    icon: Mail,

    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Enter your name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },
      {
        id: "subject",
        label: "Subject",
        type: "text",
        required: true,
        placeholder: "What is your inquiry about?",
      },
      {
        id: "message",
        label: "Message",
        type: "textarea",
        required: true,
        placeholder: "Tell us how we can help...",
      },
    ],

    sampleQuestions: [
      "Your Name and Email Address",
      "Subject of inquiry",
      "How can our team help you today?",
    ],
  },

  {
    id: "job-application",
    title: "Job Application",
    description:
      "Collect applicant details, resume links, and role qualifications.",
    category: "HR",
    questions: 8,
    time: "5 min",
    icon: Users,

    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Candidate full name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "candidate@example.com",
      },
      {
        id: "phone",
        label: "Phone Number",
        type: "text",
        required: true,
        placeholder: "10-digit phone number",
      },
      {
        id: "position",
        label: "Position Applied For",
        type: "text",
        required: true,
        placeholder: "e.g. Frontend Developer",
      },
      {
        id: "experience",
        label: "Years of Experience",
        type: "number",
        required: true,
        placeholder: "e.g. 2",
      },
      {
        id: "portfolio",
        label: "Portfolio / LinkedIn URL",
        type: "text",
        required: false,
        placeholder: "https://...",
      },
      {
        id: "education",
        label: "Highest Qualification",
        type: "text",
        required: true,
        placeholder: "e.g. B.Tech",
      },
      {
        id: "coverLetter",
        label: "Cover Letter",
        type: "textarea",
        required: false,
        placeholder: "Tell us about yourself...",
      },
    ],

    sampleQuestions: [
      "Candidate Name and Contact Info",
      "Link to Portfolio or LinkedIn",
      "Years of relevant work experience",
    ],
  },

  {
    id: "product-survey",
    title: "Product Survey",
    description:
      "Understand user needs, desired features, and pain points.",
    category: "Surveys",
    questions: 6,
    time: "3 min",
    icon: CheckSquare,

    fields: [
      {
        id: "name",
        label: "Name",
        type: "text",
        required: false,
        placeholder: "Your name",
      },
      {
        id: "usageFrequency",
        label: "How often do you use our product?",
        type: "select",
        required: true,
        options: [
          { label: "Daily", value: "daily" },
          { label: "Weekly", value: "weekly" },
          { label: "Monthly", value: "monthly" },
          { label: "Rarely", value: "rarely" },
        ],
      },
      {
        id: "favoriteFeature",
        label: "Most Used Feature",
        type: "text",
        required: false,
        placeholder: "Which feature do you use most?",
      },
      {
        id: "satisfaction",
        label: "Overall Satisfaction",
        type: "select",
        required: true,
        options: [
          { label: "Very Satisfied", value: "very_satisfied" },
          { label: "Satisfied", value: "satisfied" },
          { label: "Neutral", value: "neutral" },
          { label: "Dissatisfied", value: "dissatisfied" },
        ],
      },
      {
        id: "featureRequest",
        label: "Feature Request",
        type: "textarea",
        required: false,
        placeholder: "What feature would you like next?",
      },
      {
        id: "additionalComments",
        label: "Additional Comments",
        type: "textarea",
        required: false,
        placeholder: "Anything else you would like to share?",
      },
    ],

    sampleQuestions: [
      "How often do you use our product?",
      "Which tool do you use the most?",
      "What new capability would you like next?",
    ],
  },

  {
    id: "newsletter-signup",
    title: "Newsletter Signup",
    description:
      "Fast, one-step subscription form to grow your audience and email list.",
    category: "Registration",
    questions: 3,
    time: "1 min",
    icon: Sparkles,

    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: false,
        placeholder: "Your name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },
      {
        id: "topics",
        label: "Topics of Interest",
        type: "select",
        required: false,
        options: [
          { label: "Technology", value: "technology" },
          { label: "Business", value: "business" },
          { label: "Design", value: "design" },
          { label: "All Topics", value: "all" },
        ],
      },
    ],

    sampleQuestions: [
      "Your Email Address",
      "Topics you are interested in",
    ],
  },
];

const CATEGORIES = [
  "All",
  "Feedback",
  "Registration",
  "Contact",
  "HR",
  "Surveys",
];

const Templates = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [creatingTemplate, setCreatingTemplate] = useState(null);

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      tpl.title.toLowerCase().includes(search) ||
      tpl.description.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "All" ||
      tpl.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template) => {
    setCreatingTemplate(template.id);

    try {
      const result = await saveFormToBackend({
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        version: 1,
        fields: template.fields,
      });

      if (!result.success) {
        alert(
          result.error ||
            "Failed to create form from template."
        );
        return;
      }

      setPreviewTemplate(null);

      navigate("/generated-form", {
        state: {
          schema: result.data,
        },
      });
    } catch (error) {
      console.error(
        "Template creation failed:",
        error
      );

      alert(
        "Something went wrong while creating the form."
      );
    } finally {
      setCreatingTemplate(null);
    }
  };

  const handleBlankForm = () => {
    navigate("/ai-input");
  };

  return (
    <div className="templates-page">
      {/* HEADER */}
      <header className="templates-header">
        <div>
          <p className="templates-label">
            Templates
          </p>

          <h1>Form Templates</h1>

          <p className="templates-subtitle">
            Choose a ready-to-use template or start from scratch.
          </p>
        </div>

        <button
          className="create-btn"
          onClick={handleBlankForm}
        >
          <Plus size={18} />
          Blank Form
        </button>
      </header>

      {/* SEARCH & CATEGORY */}
      <div className="templates-filter-bar">
        <div className="search-input-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>

        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${
                selectedCategory === cat
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory(cat)
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TEMPLATE GRID */}
      <div className="templates-grid">
        {filteredTemplates.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "50px",
              textAlign: "center",
              color: "#7a8494",
            }}
          >
            No templates found.
          </div>
        ) : (
          filteredTemplates.map((tpl) => {
            const Icon = tpl.icon;

            const isCreating =
              creatingTemplate === tpl.id;

            return (
              <div
                key={tpl.id}
                className="template-card"
              >
                <div className="card-top">
                  <div className="template-icon">
                    <Icon size={20} />
                  </div>

                  <span className="card-badge">
                    {tpl.category}
                  </span>
                </div>

                <h3>{tpl.title}</h3>

                <p>{tpl.description}</p>

                <div className="card-meta">
                  <div className="meta-item">
                    <FileText size={14} />

                    <span>
                      {tpl.questions} questions
                    </span>
                  </div>

                  <div className="meta-item">
                    <Clock size={14} />

                    <span>{tpl.time}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-preview"
                    onClick={() =>
                      setPreviewTemplate(tpl)
                    }
                    disabled={isCreating}
                  >
                    Preview
                  </button>

                  <button
                    className="btn-use"
                    onClick={() =>
                      handleUseTemplate(tpl)
                    }
                    disabled={isCreating}
                  >
                    {isCreating
                      ? "Creating..."
                      : "Use Template"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <div
          className="simple-modal-overlay"
          onClick={() =>
            setPreviewTemplate(null)
          }
        >
          <div
            className="simple-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="simple-modal-header">
              <h3>
                {previewTemplate.title} Preview
              </h3>

              <button
                className="close-btn"
                onClick={() =>
                  setPreviewTemplate(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="simple-modal-body">
              <p className="modal-desc">
                {previewTemplate.description}
              </p>

              <div className="preview-questions-title">
                Sample Questions:
              </div>

              <div className="preview-questions-list">
                {previewTemplate.sampleQuestions.map(
                  (question, index) => (
                    <div
                      key={index}
                      className="preview-q-item"
                    >
                      {index + 1}. {question}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="simple-modal-footer">
              <button
                className="btn-secondary"
                onClick={() =>
                  setPreviewTemplate(null)
                }
              >
                Close
              </button>

              <button
                className="btn-use"
                onClick={() =>
                  handleUseTemplate(
                    previewTemplate
                  )
                }
                disabled={
                  creatingTemplate ===
                  previewTemplate.id
                }
              >
                {creatingTemplate ===
                previewTemplate.id
                  ? "Creating..."
                  : "Use This Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;