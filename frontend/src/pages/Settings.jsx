import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  X,
} from "lucide-react";

import "./Settings.css";

const DEFAULT_SETTINGS = {
  notifications: {
    email: true,
    formUpdates: true,
    aiSuggestions: true,
  },
  twoFactor: false,
  language: "English",
  dateFormat: "DD/MM/YYYY",
  timezone: "India Standard Time",
  theme: "light",
};

const Settings = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState("Account");

  const [account, setAccount] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [notifications, setNotifications] =
    useState(DEFAULT_SETTINGS.notifications);

  const [twoFactor, setTwoFactor] =
    useState(false);

  const [theme, setTheme] =
    useState("light");

  const [preferences, setPreferences] =
    useState({
      language: "English",
      dateFormat: "DD/MM/YYYY",
      timezone: "India Standard Time",
    });

  const [accountMessage, setAccountMessage] =
    useState("");

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

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

  /* ================= LOAD SETTINGS ================= */

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const currentUser =
        localStorage.getItem(
          "forma_current_user"
        );

      const savedProfile =
        localStorage.getItem(
          "forma_profile"
        );

      const savedSettings =
        localStorage.getItem(
          "forma_settings"
        );

      const user = currentUser
        ? JSON.parse(currentUser)
        : {};

      const profile = savedProfile
        ? JSON.parse(savedProfile)
        : {};

      const settings = savedSettings
        ? JSON.parse(savedSettings)
        : {};

      setAccount({
        name:
          profile.name ||
          user.name ||
          "",
        email:
          profile.email ||
          user.email ||
          "",
        phone:
          profile.phone ||
          "",
        bio:
          profile.bio ||
          "",
      });

      setNotifications({
        ...DEFAULT_SETTINGS.notifications,
        ...(settings.notifications || {}),
      });

      setTwoFactor(
        settings.twoFactor ??
          DEFAULT_SETTINGS.twoFactor
      );

      setTheme(
        settings.theme ||
          DEFAULT_SETTINGS.theme
      );

      setPreferences({
        language:
          settings.language ||
          DEFAULT_SETTINGS.language,
        dateFormat:
          settings.dateFormat ||
          DEFAULT_SETTINGS.dateFormat,
        timezone:
          settings.timezone ||
          DEFAULT_SETTINGS.timezone,
      });
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );
    }
  };

  /* ================= SAVE SETTINGS ================= */

  const saveSettings = (
    overrides = {}
  ) => {
    try {
      const settings = {
        notifications,
        twoFactor,
        theme,
        ...preferences,
        ...overrides,
      };

      localStorage.setItem(
        "forma_settings",
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error(
        "Failed to save settings:",
        error
      );
    }
  };

  /* ================= ACCOUNT ================= */

  const handleAccountChange = (e) => {
    setAccount((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setAccountMessage("");
  };

  const saveAccount = () => {
    try {
      const updatedAccount = {
        ...account,
        name: account.name.trim(),
        email: account.email
          .trim()
          .toLowerCase(),
        phone: account.phone.trim(),
        bio: account.bio.trim(),
      };

      const savedProfile = {
        ...updatedAccount,
        role: "Student",
        branch:
          "Information Technology",
      };

      localStorage.setItem(
        "forma_profile",
        JSON.stringify(savedProfile)
      );

      localStorage.setItem(
        "forma_current_user",
        JSON.stringify({
          name: updatedAccount.name,
          email: updatedAccount.email,
        })
      );

      const storedUser =
        localStorage.getItem(
          "forma_user"
        );

      if (storedUser) {
        const user = JSON.parse(
          storedUser
        );

        localStorage.setItem(
          "forma_user",
          JSON.stringify({
            ...user,
            name: updatedAccount.name,
            email: updatedAccount.email,
          })
        );
      }

      setAccount(updatedAccount);

      setAccountMessage(
        "Account information saved successfully."
      );

      setTimeout(() => {
        setAccountMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to save account:",
        error
      );

      setAccountMessage(
        "Unable to save account information."
      );
    }
  };

  /* ================= NOTIFICATIONS ================= */

  const toggleNotification = (key) => {
    setNotifications((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };

      try {
        const existing =
          localStorage.getItem(
            "forma_settings"
          );

        const settings = existing
          ? JSON.parse(existing)
          : {};

        localStorage.setItem(
          "forma_settings",
          JSON.stringify({
            ...settings,
            notifications: updated,
          })
        );
      } catch (error) {
        console.error(
          "Failed to save notifications:",
          error
        );
      }

      return updated;
    });
  };

  /* ================= SECURITY ================= */

  const handlePasswordChange =
    (e) => {
      setPasswordForm((prev) => ({
        ...prev,
        [e.target.name]:
          e.target.value,
      }));

      setPasswordError("");
      setPasswordMessage("");
    };

  const changePassword = () => {
    setPasswordError("");
    setPasswordMessage("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (
      passwordForm.newPassword.length < 8
    ) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    try {
      const storedUser =
        localStorage.getItem(
          "forma_user"
        );

      if (!storedUser) {
        setPasswordError(
          "No account found."
        );
        return;
      }

      const user = JSON.parse(
        storedUser
      );

      if (
        user.password !==
        passwordForm.currentPassword
      ) {
        setPasswordError(
          "Current password is incorrect."
        );
        return;
      }

      localStorage.setItem(
        "forma_user",
        JSON.stringify({
          ...user,
          password:
            passwordForm.newPassword,
        })
      );

      setPasswordMessage(
        "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 1500);
    } catch (error) {
      console.error(
        "Password change failed:",
        error
      );

      setPasswordError(
        "Unable to change password."
      );
    }
  };

  const toggleTwoFactor = () => {
    setTwoFactor((prev) => {
      const updated = !prev;

      saveSettings({
        twoFactor: updated,
      });

      return updated;
    });
  };

  const handleSignOutAll =
    () => {
      localStorage.removeItem(
        "forma_logged_in"
      );

      localStorage.removeItem(
        "forma_current_user"
      );

      navigate("/login");
    };

  /* ================= APPEARANCE ================= */

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);

    saveSettings({
      theme: nextTheme,
    });
  };

  /* ================= PREFERENCES ================= */

  const updatePreference = (
    key,
    value
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));

    saveSettings({
      [key]: value,
    });
  };

  /* ================= DELETE ACCOUNT ================= */

  const deleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your Forma AI account? This will remove your local account and profile data."
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "forma_user"
    );

    localStorage.removeItem(
      "forma_current_user"
    );

    localStorage.removeItem(
      "forma_profile"
    );

    localStorage.removeItem(
      "forma_settings"
    );

    localStorage.removeItem(
      "forma_logged_in"
    );

    navigate("/signup");
  };

  /* ================= TOGGLE ================= */

  const Toggle = ({
    enabled,
    onClick,
  }) => {
    return (
      <button
        className={`settings-toggle ${
          enabled ? "enabled" : ""
        }`}
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
            Manage your Forma AI account and
            application preferences.
          </p>
        </div>
      </div>

      {/* SETTINGS LAYOUT */}

      <div className="settings-layout">

        {/* LEFT MENU */}

        <aside className="settings-sidebar">

          {sections.map(
            (section) => {
              const Icon =
                section.icon;

              return (
                <button
                  key={section.name}
                  className={`settings-menu-item ${
                    activeSection ===
                    section.name
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveSection(
                      section.name
                    )
                  }
                >
                  <Icon size={18} />

                  <span>
                    {section.name}
                  </span>

                  {activeSection ===
                    section.name && (
                    <ChevronRight
                      size={16}
                    />
                  )}
                </button>
              );
            }
          )}

        </aside>

        {/* CONTENT */}

        <main className="settings-content">

          {/* ACCOUNT */}

          {activeSection ===
            "Account" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>
                    Account Information
                  </h2>

                  <p>
                    Manage the information
                    associated with your
                    account.
                  </p>
                </div>

                <User size={22} />
              </div>

              {accountMessage && (
                <div
                  style={{
                    marginBottom: 18,
                    padding:
                      "11px 13px",
                    borderRadius: 9,
                    background:
                      "#ecfdf5",
                    border:
                      "1px solid #a7f3d0",
                    color:
                      "#047857",
                    fontSize: 13,
                  }}
                >
                  {accountMessage}
                </div>
              )}

              <div className="account-form">

                <div className="settings-field">
                  <label>
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      account.name
                    }
                    onChange={
                      handleAccountChange
                    }
                    placeholder="Your name"
                  />

                  <small>
                    Your name will be
                    displayed throughout
                    Forma AI.
                  </small>
                </div>

                <div className="settings-field">
                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      account.email
                    }
                    onChange={
                      handleAccountChange
                    }
                    placeholder="Your email address"
                  />

                  <small>
                    This email is associated
                    with your Forma AI
                    account.
                  </small>
                </div>

                <div className="settings-field">
                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      account.phone
                    }
                    onChange={
                      handleAccountChange
                    }
                    placeholder="Add phone number"
                  />
                </div>

                <div className="settings-field">
                  <label>
                    Bio
                  </label>

                  <textarea
                    name="bio"
                    value={
                      account.bio
                    }
                    onChange={
                      handleAccountChange
                    }
                    placeholder="Tell us a little about yourself..."
                    rows="4"
                  />
                </div>

              </div>

              <div className="settings-actions">
                <button
                  className="primary-settings-btn"
                  onClick={
                    saveAccount
                  }
                >
                  Save Changes
                </button>
              </div>

            </section>
          )}

          {/* NOTIFICATIONS */}

          {activeSection ===
            "Notifications" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>
                    Notifications
                  </h2>

                  <p>
                    Choose which
                    notifications you
                    want to receive.
                  </p>
                </div>

                <Bell size={22} />
              </div>

              <div className="settings-option">

                <div>
                  <strong>
                    Email Notifications
                  </strong>

                  <span>
                    Receive important
                    updates through
                    email.
                  </span>
                </div>

                <Toggle
                  enabled={
                    notifications.email
                  }
                  onClick={() =>
                    toggleNotification(
                      "email"
                    )
                  }
                />

              </div>

              <div className="settings-option">

                <div>
                  <strong>
                    Form Updates
                  </strong>

                  <span>
                    Get notified when
                    your forms are
                    updated.
                  </span>
                </div>

                <Toggle
                  enabled={
                    notifications.formUpdates
                  }
                  onClick={() =>
                    toggleNotification(
                      "formUpdates"
                    )
                  }
                />

              </div>

              <div className="settings-option">

                <div>
                  <strong>
                    AI Suggestions
                  </strong>

                  <span>
                    Receive suggestions
                    generated by Forma
                    AI.
                  </span>
                </div>

                <Toggle
                  enabled={
                    notifications.aiSuggestions
                  }
                  onClick={() =>
                    toggleNotification(
                      "aiSuggestions"
                    )
                  }
                />

              </div>

            </section>
          )}

          {/* SECURITY */}

          {activeSection ===
            "Security" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>
                    Security
                  </h2>

                  <p>
                    Protect your Forma
                    AI account.
                  </p>
                </div>

                <Shield size={22} />
              </div>

              <div className="security-option">

                <div className="security-icon">
                  <Lock size={19} />
                </div>

                <div className="security-info">
                  <strong>
                    Password
                  </strong>

                  <span>
                    Change your account
                    password.
                  </span>
                </div>

                <button
                  className="secondary-settings-btn"
                  onClick={() => {
                    setPasswordError("");
                    setPasswordMessage("");
                    setShowPasswordModal(
                      true
                    );
                  }}
                >
                  Change
                </button>

              </div>

              <div className="security-option">

                <div className="security-icon">
                  <Shield size={19} />
                </div>

                <div className="security-info">
                  <strong>
                    Two-Factor
                    Authentication
                  </strong>

                  <span>
                    Add an additional
                    layer of account
                    security.
                  </span>
                </div>

                <Toggle
                  enabled={
                    twoFactor
                  }
                  onClick={
                    toggleTwoFactor
                  }
                />

              </div>

              <div className="security-option">

                <div className="security-icon">
                  <Smartphone
                    size={19}
                  />
                </div>

                <div className="security-info">
                  <strong>
                    Active Sessions
                  </strong>

                  <span>
                    Manage devices
                    currently signed in.
                  </span>
                </div>

                <button
                  className="secondary-settings-btn"
                  onClick={
                    handleSignOutAll
                  }
                >
                  Manage
                </button>

              </div>

              <div className="logout-section">

                <div>
                  <strong>
                    Sign out of all
                    devices
                  </strong>

                  <span>
                    Sign out from every
                    device connected to
                    your account.
                  </span>
                </div>

                <button
                  className="logout-btn"
                  onClick={
                    handleSignOutAll
                  }
                >
                  <LogOut size={16} />
                  Sign Out
                </button>

              </div>

            </section>
          )}

          {/* APPEARANCE */}

          {activeSection ===
            "Appearance" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>
                    Appearance
                  </h2>

                  <p>
                    Customize how Forma
                    AI looks on your
                    device.
                  </p>
                </div>

                <Palette size={22} />
              </div>

              <div className="theme-options">

                <button
                  type="button"
                  className={`theme-card ${
                    theme === "light"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    changeTheme(
                      "light"
                    )
                  }
                >
                  <div className="theme-preview light-preview">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>

                  <div className="theme-name">
                    <span>
                      Light
                    </span>

                    {theme ===
                      "light" && (
                      <Check
                        size={17}
                      />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  className={`theme-card ${
                    theme === "dark"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    changeTheme(
                      "dark"
                    )
                  }
                >
                  <div className="theme-preview dark-preview">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>

                  <div className="theme-name">
                    <span>
                      Dark
                    </span>

                    {theme ===
                      "dark" && (
                      <Check
                        size={17}
                      />
                    )}
                  </div>
                </button>

              </div>

            </section>
          )}

          {/* PREFERENCES */}

          {activeSection ===
            "Preferences" && (
            <section className="settings-card">

              <div className="settings-card-header">
                <div>
                  <h2>
                    Preferences
                  </h2>

                  <p>
                    Customize your
                    Forma AI experience.
                  </p>
                </div>

                <Globe size={22} />
              </div>

              <div className="settings-field">

                <label>
                  Language
                </label>

                <select
                  value={
                    preferences.language
                  }
                  onChange={(e) =>
                    updatePreference(
                      "language",
                      e.target.value
                    )
                  }
                >
                  <option>
                    English
                  </option>
                </select>

              </div>

              <div className="settings-field">

                <label>
                  Date Format
                </label>

                <select
                  value={
                    preferences.dateFormat
                  }
                  onChange={(e) =>
                    updatePreference(
                      "dateFormat",
                      e.target.value
                    )
                  }
                >
                  <option>
                    DD/MM/YYYY
                  </option>

                  <option>
                    MM/DD/YYYY
                  </option>

                  <option>
                    YYYY-MM-DD
                  </option>
                </select>

              </div>

              <div className="settings-field">

                <label>
                  Timezone
                </label>

                <select
                  value={
                    preferences.timezone
                  }
                  onChange={(e) =>
                    updatePreference(
                      "timezone",
                      e.target.value
                    )
                  }
                >
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
                <h2>
                  Delete Account
                </h2>

                <p>
                  Permanently delete your
                  Forma AI account and
                  associated local data.
                </p>
              </div>

            </div>

            <button
              className="delete-account-btn"
              onClick={
                deleteAccount
              }
            >
              Delete Account
            </button>

          </section>

        </main>
      </div>

      {/* CHANGE PASSWORD MODAL */}

      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: 20,
            zIndex: 1000,
          }}
          onClick={() =>
            setShowPasswordModal(
              false
            )
          }
        >
          <div
            style={{
              width: "100%",
              maxWidth: 450,
              background:
                "#ffffff",
              borderRadius: 14,
              padding: 24,
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.15)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: 22,
              }}
            >
              <div>
                <h2
                  style={{
                    margin:
                      "0 0 5px",
                  }}
                >
                  Change Password
                </h2>

                <p
                  style={{
                    margin: 0,
                    color:
                      "#7a8494",
                    fontSize:
                      13,
                  }}
                >
                  Update your
                  account password.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPasswordModal(
                    false
                  )
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                  color:
                    "#64748b",
                }}
              >
                <X size={19} />
              </button>
            </div>

            {passwordError && (
              <div
                style={{
                  marginBottom: 14,
                  padding:
                    "10px 12px",
                  borderRadius: 8,
                  background:
                    "#fef2f2",
                  border:
                    "1px solid #fecaca",
                  color:
                    "#b91c1c",
                  fontSize:
                    13,
                }}
              >
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div
                style={{
                  marginBottom: 14,
                  padding:
                    "10px 12px",
                  borderRadius: 8,
                  background:
                    "#ecfdf5",
                  border:
                    "1px solid #a7f3d0",
                  color:
                    "#047857",
                  fontSize:
                    13,
                }}
              >
                {passwordMessage}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: 15,
              }}
            >
              <label>
                <span
                  style={{
                    display:
                      "block",
                    marginBottom:
                      6,
                    fontSize:
                      13,
                    fontWeight:
                      600,
                  }}
                >
                  Current Password
                </span>

                <input
                  type="password"
                  name="currentPassword"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "11px 12px",
                    border:
                      "1px solid #dfe3ea",
                    borderRadius:
                      8,
                    outline:
                      "none",
                  }}
                />
              </label>

              <label>
                <span
                  style={{
                    display:
                      "block",
                    marginBottom:
                      6,
                    fontSize:
                      13,
                    fontWeight:
                      600,
                  }}
                >
                  New Password
                </span>

                <input
                  type="password"
                  name="newPassword"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "11px 12px",
                    border:
                      "1px solid #dfe3ea",
                    borderRadius:
                      8,
                    outline:
                      "none",
                  }}
                />
              </label>

              <label>
                <span
                  style={{
                    display:
                      "block",
                    marginBottom:
                      6,
                    fontSize:
                      13,
                    fontWeight:
                      600,
                  }}
                >
                  Confirm New Password
                </span>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "11px 12px",
                    border:
                      "1px solid #dfe3ea",
                    borderRadius:
                      8,
                    outline:
                      "none",
                  }}
                />
              </label>
            </div>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap: 10,
                marginTop: 22,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setShowPasswordModal(
                    false
                  )
                }
                style={{
                  padding:
                    "10px 15px",
                  border:
                    "1px solid #dfe3ea",
                  borderRadius: 8,
                  background:
                    "#ffffff",
                  cursor:
                    "pointer",
                  fontWeight:
                    600,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  changePassword
                }
                style={{
                  padding:
                    "10px 15px",
                  border: "none",
                  borderRadius: 8,
                  background:
                    "#4f46e5",
                  color:
                    "#ffffff",
                  cursor:
                    "pointer",
                  fontWeight:
                    600,
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;