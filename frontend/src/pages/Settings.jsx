import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Smartphone,
  LogOut,
  Trash2,
  ChevronRight,
  Check,
} from "lucide-react";

import "./Settings.css";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("Account");

  const [notifications, setNotifications] = useState({
    email: true,
    formUpdates: true,
    aiSuggestions: true,
  });

  const [twoFactor, setTwoFactor] = useState(false);

  const [theme, setTheme] = useState("light");

  const sections = [
    {
      name: "Account",
      icon: User,
    },
    {
      name: "Notifications",
      icon: Bell,
    },
    {
      name: "Security",
      icon: Shield,
    },
    {
      name: "Appearance",
      icon: Palette,
    },
    {
      name: "Preferences",
      icon: Globe,
    },
  ];

  const Toggle = ({ enabled, onClick }) => {
    return (
      <button
        className={`settings-toggle ${enabled ? "enabled" : ""}`}
        onClick={onClick}
        type="button"
      >
        <span></span>
      </button>
    );
  };

  return (
    <div className="settings-page">

      {/* HEADER */}

      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your Forma AI account and application preferences.
          </p>
        </div>
      </div>

      {/* SETTINGS LAYOUT */}

      <div className="settings-layout">

        {/* LEFT MENU */}

        <aside className="settings-sidebar">

          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.name}
                className={`settings-menu-item ${
                  activeSection === section.name ? "active" : ""
                }`}
                onClick={() => setActiveSection(section.name)}
              >
                <Icon size={18} />

                <span>{section.name}</span>

                {activeSection === section.name && (
                  <ChevronRight size={16} />
                )}
              </button>
            );
          })}

        </aside>

        {/* CONTENT */}

        <main className="settings-content">

          {/* ACCOUNT */}

          {activeSection === "Account" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>Account Information</h2>
                  <p>
                    Manage the information associated with your account.
                  </p>
                </div>

                <User size={22} />
              </div>

              <div className="account-form">

                <div className="settings-field">
                  <label>Name</label>

                  <input
                    type="text"
                    placeholder="Your name"
                  />

                  <small>
                    Your name will be displayed throughout Forma AI.
                  </small>
                </div>

                <div className="settings-field">
                  <label>Email Address</label>

                  <input
                    type="email"
                    placeholder="Your email address"
                  />

                  <small>
                    This email is associated with your Forma AI account.
                  </small>
                </div>

                <div className="settings-field">
                  <label>Phone Number</label>

                  <input
                    type="tel"
                    placeholder="Add phone number"
                  />
                </div>

                <div className="settings-field">
                  <label>Bio</label>

                  <textarea
                    placeholder="Tell us a little about yourself..."
                    rows="4"
                  />
                </div>

              </div>

              <div className="settings-actions">
                <button className="primary-settings-btn">
                  Save Changes
                </button>
              </div>

            </section>
          )}

          {/* NOTIFICATIONS */}

          {activeSection === "Notifications" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>Notifications</h2>
                  <p>
                    Choose which notifications you want to receive.
                  </p>
                </div>

                <Bell size={22} />
              </div>

              <div className="settings-option">

                <div>
                  <strong>Email Notifications</strong>

                  <span>
                    Receive important updates through email.
                  </span>
                </div>

                <Toggle
                  enabled={notifications.email}
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      email: !notifications.email,
                    })
                  }
                />

              </div>

              <div className="settings-option">

                <div>
                  <strong>Form Updates</strong>

                  <span>
                    Get notified when your forms are updated.
                  </span>
                </div>

                <Toggle
                  enabled={notifications.formUpdates}
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      formUpdates: !notifications.formUpdates,
                    })
                  }
                />

              </div>

              <div className="settings-option">

                <div>
                  <strong>AI Suggestions</strong>

                  <span>
                    Receive suggestions generated by Forma AI.
                  </span>
                </div>

                <Toggle
                  enabled={notifications.aiSuggestions}
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      aiSuggestions: !notifications.aiSuggestions,
                    })
                  }
                />

              </div>

            </section>
          )}

          {/* SECURITY */}

          {activeSection === "Security" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>Security</h2>
                  <p>
                    Protect your Forma AI account.
                  </p>
                </div>

                <Shield size={22} />
              </div>

              <div className="security-option">

                <div className="security-icon">
                  <Lock size={19} />
                </div>

                <div className="security-info">
                  <strong>Password</strong>

                  <span>
                    Change your account password.
                  </span>
                </div>

                <button className="secondary-settings-btn">
                  Change
                </button>

              </div>

              <div className="security-option">

                <div className="security-icon">
                  <Shield size={19} />
                </div>

                <div className="security-info">
                  <strong>Two-Factor Authentication</strong>

                  <span>
                    Add an additional layer of account security.
                  </span>
                </div>

                <Toggle
                  enabled={twoFactor}
                  onClick={() => setTwoFactor(!twoFactor)}
                />

              </div>

              <div className="security-option">

                <div className="security-icon">
                  <Smartphone size={19} />
                </div>

                <div className="security-info">
                  <strong>Active Sessions</strong>

                  <span>
                    Manage devices currently signed in.
                  </span>
                </div>

                <button className="secondary-settings-btn">
                  Manage
                </button>

              </div>

              <div className="logout-section">

                <div>
                  <strong>Sign out of all devices</strong>

                  <span>
                    Sign out from every device connected to your account.
                  </span>
                </div>

                <button className="logout-btn">
                  <LogOut size={16} />
                  Sign Out
                </button>

              </div>

            </section>
          )}

          {/* APPEARANCE */}

          {activeSection === "Appearance" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>Appearance</h2>
                  <p>
                    Customize how Forma AI looks on your device.
                  </p>
                </div>

                <Palette size={22} />
              </div>

              <div className="theme-options">

                <button
                  className={`theme-card ${
                    theme === "light" ? "selected" : ""
                  }`}
                  onClick={() => setTheme("light")}
                >
                  <div className="theme-preview light-preview">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>

                  <div className="theme-name">
                    <span>Light</span>

                    {theme === "light" && (
                      <Check size={17} />
                    )}
                  </div>
                </button>

                <button
                  className={`theme-card ${
                    theme === "dark" ? "selected" : ""
                  }`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="theme-preview dark-preview">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>

                  <div className="theme-name">
                    <span>Dark</span>

                    {theme === "dark" && (
                      <Check size={17} />
                    )}
                  </div>
                </button>

              </div>

            </section>
          )}

          {/* PREFERENCES */}

          {activeSection === "Preferences" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>Preferences</h2>
                  <p>
                    Customize your Forma AI experience.
                  </p>
                </div>

                <Globe size={22} />
              </div>

              <div className="settings-field">

                <label>Language</label>

                <select defaultValue="English">
                  <option>English</option>
                </select>

              </div>

              <div className="settings-field">

                <label>Date Format</label>

                <select defaultValue="DD/MM/YYYY">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>

              </div>

              <div className="settings-field">

                <label>Timezone</label>

                <select defaultValue="">
                  <option value="" disabled>
                    Select your timezone
                  </option>
                  <option>
                    India Standard Time
                  </option>
                  <option>
                    Coordinated Universal Time
                  </option>
                </select>

              </div>

            </section>
          )}

          {/* DANGER ZONE */}

          <section className="danger-card">

            <div className="danger-header">

              <div className="danger-icon">
                <Trash2 size={20} />
              </div>

              <div>
                <h2>Delete Account</h2>

                <p>
                  Permanently delete your Forma AI account and associated
                  data.
                </p>
              </div>

            </div>

            <button className="delete-account-btn">
              Delete Account
            </button>

          </section>

        </main>

      </div>

    </div>
  );
};

export default Settings;