import React, { useState } from "react";
import {
  Home,
  FileText,
  LayoutTemplate,
  Send,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  Camera,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Shield,
  SlidersHorizontal,
  Activity,
  Lock,
  X,
  Save,
  LogOut,
  Sparkles,
} from "lucide-react";

import "./Profile.css";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [profile, setProfile] = useState({
    name: "Kaif Mohammed",
    role: "Student",
    branch: "Information Technology",
    email: "kaif@example.com",
    phone: "",
    location: "",
    bio: "Passionate about building intelligent solutions and exploring AI, full-stack development, and real-world problem solving. Currently working on Forma AI – an AI-Augmented Dynamic Form Engine.",
  });

  const [editForm, setEditForm] = useState(profile);

  const tabs = [
    { name: "Overview", icon: User },
    { name: "Personal Info", icon: User },
    { name: "Security", icon: Shield },
    { name: "Preferences", icon: SlidersHorizontal },
    { name: "Activity", icon: Activity },
  ];

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = () => {
    setProfile(editForm);
    setShowEditModal(false);
    setSavedMessage("Profile updated successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  return (
    <div className="forma-app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">F</div>
          <span>Forma AI</span>
        </div>

        <nav className="sidebar-nav">

          <NavItem
            icon={<Home size={19} />}
            text="Dashboard"
          />

          <NavItem
            icon={<FileText size={19} />}
            text="My Forms"
          />

          <NavItem
            icon={<LayoutTemplate size={19} />}
            text="Templates"
          />

          <NavItem
            icon={<Send size={19} />}
            text="Submissions"
          />

          <NavItem
            icon={<BarChart3 size={19} />}
            text="Analytics"
          />

          <NavItem
            icon={<User size={19} />}
            text="Profile"
            active
          />

        </nav>

        <div className="sidebar-bottom">

          <NavItem
            icon={<Settings size={19} />}
            text="Settings"
          />

          <NavItem
            icon={<HelpCircle size={19} />}
            text="Help & Support"
          />

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search forms, templates..."
            />

          </div>

          <div className="topbar-right">

            <button className="notification-btn">
              <Bell size={20} />
            </button>

            <div className="user-menu">

              <div className="small-avatar">
                K
              </div>

              <span>Kaif</span>

              <ChevronDown size={16} />

            </div>

          </div>

        </header>

        {/* SUCCESS MESSAGE */}

        {savedMessage && (
          <div className="success-message">
            {savedMessage}
          </div>
        )}

        {/* ================= PROFILE HEADER ================= */}

        <section className="profile-header">

          <div className="cover-image">
            <div className="cover-overlay"></div>

            <button className="change-cover">
              <Camera size={16} />
              Change Cover
            </button>
          </div>

          <div className="profile-main">

            <div className="profile-avatar-wrapper">

              <div className="profile-avatar">
                K
              </div>

              <button className="avatar-camera">
                <Camera size={14} />
              </button>

            </div>

            <div className="profile-info">

              <div className="name-row">

                <h1>{profile.name}</h1>

                <span className="role-badge">
                  {profile.role}
                </span>

              </div>

              <p className="branch-text">
                {profile.branch}
              </p>

              <div className="profile-meta">

                <span>
                  <Mail size={15} />
                  {profile.email}
                </span>

                {profile.phone && (
                  <span>
                    <Phone size={15} />
                    {profile.phone}
                  </span>
                )}

                {profile.location && (
                  <span>
                    <MapPin size={15} />
                    {profile.location}
                  </span>
                )}

              </div>

            </div>

            <button
              className="edit-profile-btn"
              onClick={() => {
                setEditForm(profile);
                setShowEditModal(true);
              }}
            >
              <Pencil size={16} />
              Edit Profile
            </button>

          </div>

          {/* TABS */}

          <div className="profile-tabs">

            {tabs.map((tab) => {

              const Icon = tab.icon;

              return (
                <button
                  key={tab.name}
                  className={
                    activeTab === tab.name
                      ? "profile-tab active"
                      : "profile-tab"
                  }
                  onClick={() => setActiveTab(tab.name)}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );

            })}

          </div>

        </section>

        {/* ================= OVERVIEW ================= */}

        {activeTab === "Overview" && (

          <section className="overview-grid">

            {/* ABOUT */}

            <div className="card about-card">

              <div className="card-title">

                <h2>About Me</h2>

                <button
                  className="icon-button"
                  onClick={() => {
                    setEditForm(profile);
                    setShowEditModal(true);
                  }}
                >
                  <Pencil size={15} />
                </button>

              </div>

              <p className="about-text">
                {profile.bio}
              </p>

            </div>

            {/* SKILLS */}

            <div className="card">

              <div className="card-title">

                <h2>Skills</h2>

              </div>

              <div className="skill-list">

                <span>Python</span>
                <span>Java</span>
                <span>SQL</span>
                <span>React</span>
                <span>Node.js</span>
                <span>MongoDB</span>
                <span>Machine Learning</span>
                <span>AI/ML</span>
                <span>HTML</span>
                <span>CSS</span>
                <span>JavaScript</span>

              </div>

            </div>

            {/* PERSONAL INFORMATION */}

            <div className="card">

              <div className="card-title">

                <h2>Personal Information</h2>

                <button
                  className="text-link"
                  onClick={() => setActiveTab("Personal Info")}
                >
                  View
                </button>

              </div>

              <InfoRow
                icon={<User size={17} />}
                label="Full Name"
                value={profile.name}
              />

              <InfoRow
                icon={<Mail size={17} />}
                label="Email"
                value={profile.email}
              />

              <InfoRow
                icon={<Phone size={17} />}
                label="Phone"
                value={profile.phone || "Not added"}
              />

              <InfoRow
                icon={<MapPin size={17} />}
                label="Location"
                value={profile.location || "Not added"}
              />

            </div>

            {/* ACCOUNT SECURITY */}

            <div className="card">

              <div className="card-title">

                <h2>Account Security</h2>

                <button
                  className="text-link"
                  onClick={() => setActiveTab("Security")}
                >
                  Manage
                </button>

              </div>

              <div className="security-summary">

                <div className="security-summary-icon">
                  <Shield size={22} />
                </div>

                <div>
                  <strong>Account Security</strong>
                  <p>
                    Manage your password and authentication settings.
                  </p>
                </div>

              </div>

            </div>

          </section>

        )}

        {/* ================= PERSONAL INFO ================= */}

        {activeTab === "Personal Info" && (

          <div className="tab-page card">

            <div className="tab-page-header">

              <div>
                <h2>Personal Information</h2>

                <p>
                  Manage the information associated with your Forma AI account.
                </p>
              </div>

              <button
                className="edit-profile-btn"
                onClick={() => {
                  setEditForm(profile);
                  setShowEditModal(true);
                }}
              >
                <Pencil size={16} />
                Edit
              </button>

            </div>

            <div className="personal-grid">

              <InfoBox
                label="Full Name"
                value={profile.name}
              />

              <InfoBox
                label="Role"
                value={profile.role}
              />

              <InfoBox
                label="Branch"
                value={profile.branch}
              />

              <InfoBox
                label="Email Address"
                value={profile.email}
              />

              <InfoBox
                label="Phone Number"
                value={profile.phone || "Not added"}
              />

              <InfoBox
                label="Location"
                value={profile.location || "Not added"}
              />

            </div>

            <div className="bio-section">

              <h3>Biography</h3>

              <p>
                {profile.bio}
              </p>

            </div>

          </div>

        )}

        {/* ================= SECURITY ================= */}

        {activeTab === "Security" && (

          <div className="tab-page card">

            <div className="tab-page-header">

              <div>

                <h2>Security</h2>

                <p>
                  Manage your account security settings.
                </p>

              </div>

              <Shield className="security-icon" />

            </div>

            <SecurityRow
              icon={<Lock />}
              title="Password"
              description="Change your account password."
              action="Change"
            />

            <SecurityRow
              icon={<Shield />}
              title="Two-Factor Authentication"
              description="Add an additional authentication step."
              action="Configure"
            />

            <SecurityRow
              icon={<LogOut />}
              title="Active Sessions"
              description="Review devices currently signed into your account."
              action="Manage"
            />

          </div>

        )}

        {/* ================= PREFERENCES ================= */}

        {activeTab === "Preferences" && (

          <div className="tab-page card">

            <div className="tab-page-header">

              <div>

                <h2>Preferences</h2>

                <p>
                  Customize how Forma AI communicates with you.
                </p>

              </div>

            </div>

            <PreferenceRow
              title="Email Notifications"
              description="Receive important updates about your forms and submissions."
            />

            <PreferenceRow
              title="Product Updates"
              description="Receive updates about new Forma AI features."
            />

            <PreferenceRow
              title="AI Suggestions"
              description="Allow Forma AI to provide suggestions while creating forms."
            />

          </div>

        )}

        {/* ================= ACTIVITY ================= */}

        {activeTab === "Activity" && (

          <div className="tab-page card">

            <div className="tab-page-header">

              <div>

                <h2>Activity</h2>

                <p>
                  Activity generated by your account will appear here.
                </p>

              </div>

            </div>

            <div className="empty-activity">

              <Activity size={38} />

              <h3>No activity yet</h3>

              <p>
                Your form creation, editing, and submission activity
                will appear here once you start using Forma AI.
              </p>

            </div>

          </div>

        )}

      </main>

      {/* ================= EDIT PROFILE MODAL ================= */}

      {showEditModal && (

        <div className="modal-overlay">

          <div className="edit-modal">

            <div className="modal-header">

              <div>

                <h2>Edit Profile</h2>

                <p>
                  Update your profile information.
                </p>

              </div>

              <button
                className="close-modal"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>

            </div>

            <div className="modal-body">

              <div className="modal-avatar">

                <div className="profile-avatar">
                  K
                </div>

                <button className="change-photo">
                  <Camera size={14} />
                  Change Photo
                </button>

              </div>

              <div className="form-fields">

                <label>
                  Full Name

                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                  />
                </label>

                <label>
                  Email

                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />
                </label>

                <label>
                  Phone

                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="Add phone number"
                  />
                </label>

                <label>
                  Location

                  <input
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    placeholder="Add location"
                  />
                </label>

                <label>
                  Bio

                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    maxLength={500}
                  />
                </label>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={saveProfile}
              >
                <Save size={16} />
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

/* ================= COMPONENTS ================= */

const NavItem = ({ icon, text, active }) => {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="info-row">

      <div className="info-icon">
        {icon}
      </div>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>

    </div>
  );
};

const InfoBox = ({ label, value }) => {
  return (
    <div className="info-box">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
};

const SecurityRow = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="security-row">

      <div className="security-left">

        <div className="security-icon-box">
          {icon}
        </div>

        <div>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>

      </div>

      <button className="outline-btn">
        {action}
      </button>

    </div>
  );
};

const PreferenceRow = ({
  title,
  description,
}) => {

  const [enabled, setEnabled] = useState(true);

  return (
    <div className="preference-row">

      <div>

        <strong>{title}</strong>

        <span>{description}</span>

      </div>

      <button
        className={`toggle ${enabled ? "on" : ""}`}
        onClick={() => setEnabled(!enabled)}
        aria-label={`Toggle ${title}`}
      >
        <span></span>
      </button>

    </div>
  );
};

export default Profile;