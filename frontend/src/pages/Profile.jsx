import React, { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  Code2,
  Pencil,
  Save,
  X,
  Plus,
} from "lucide-react";

function getInitialProfile() {
  const emptyProfile = {
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    education: "",
    bio: "",
    skills: [],
  };

  try {
    const savedProfile = JSON.parse(
      localStorage.getItem("forma_profile") || "null"
    );

    const currentUser = JSON.parse(
      localStorage.getItem("forma_current_user") || "null"
    );

    const storedUser = JSON.parse(
      localStorage.getItem("forma_user") || "null"
    );

    const user = currentUser || storedUser || {};

    return {
      ...emptyProfile,
      ...(savedProfile || {}),
      name: savedProfile?.name || user.name || "",
      email: savedProfile?.email || user.email || "",
      skills: Array.isArray(savedProfile?.skills)
        ? savedProfile.skills
        : [],
    };
  } catch (error) {
    console.error("Unable to load profile:", error);
    return emptyProfile;
  }
}

function Profile() {
  const [profile, setProfile] = useState(getInitialProfile);
  const [editMode, setEditMode] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setProfile(getInitialProfile());
  }, []);

  const initials = useMemo(() => {
    const name = profile.name?.trim();

    if (!name) {
      return "U";
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile.name]);

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    const alreadyExists = profile.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const handleSave = () => {
    try {
      const cleanedProfile = {
        ...profile,
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        location: profile.location.trim(),
        role: profile.role.trim(),
        education: profile.education.trim(),
        bio: profile.bio.trim(),
        skills: profile.skills.map((skill) => skill.trim()).filter(Boolean),
      };

      localStorage.setItem(
        "forma_profile",
        JSON.stringify(cleanedProfile)
      );

      const currentUser = JSON.parse(
        localStorage.getItem("forma_current_user") || "null"
      );

      if (currentUser) {
        localStorage.setItem(
          "forma_current_user",
          JSON.stringify({
            ...currentUser,
            name: cleanedProfile.name,
            email: cleanedProfile.email,
          })
        );
      }

      const storedUser = JSON.parse(
        localStorage.getItem("forma_user") || "null"
      );

      if (storedUser) {
        localStorage.setItem(
          "forma_user",
          JSON.stringify({
            ...storedUser,
            name: cleanedProfile.name,
            email: cleanedProfile.email,
          })
        );
      }

      setProfile(cleanedProfile);
      setEditMode(false);
      setMessage("Profile updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Profile save failed:", error);
      setMessage("Unable to save profile.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    }
  };

  const handleCancel = () => {
    setProfile(getInitialProfile());
    setSkillInput("");
    setEditMode(false);
    setMessage("");
  };

  const styles = {
    page: {
      minHeight: "100%",
      padding: "32px",
      boxSizing: "border-box",
      background: "#f8f9ff",
    },

    container: {
      maxWidth: "1180px",
      margin: "0 auto",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "24px",
      marginBottom: "26px",
    },

    eyebrow: {
      display: "block",
      fontSize: "13px",
      fontWeight: 600,
      color: "#6366f1",
      marginBottom: "8px",
    },

    title: {
      margin: 0,
      fontSize: "32px",
      lineHeight: 1.15,
      color: "#18233f",
      fontWeight: 700,
    },

    description: {
      margin: "9px 0 0",
      color: "#64748b",
      fontSize: "15px",
      lineHeight: 1.6,
      maxWidth: "650px",
    },

    actionGroup: {
      display: "flex",
      gap: "10px",
      flexShrink: 0,
    },

    editButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      border: "none",
      background: "#5b46f1",
      color: "#fff",
      padding: "11px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },

    cancelButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      border: "1px solid #dbe1ee",
      background: "#fff",
      color: "#475569",
      padding: "11px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },

    saveButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      border: "none",
      background: "#5b46f1",
      color: "#fff",
      padding: "11px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },

    message: {
      marginBottom: "18px",
      background: "#ecfdf3",
      border: "1px solid #bbf7d0",
      color: "#166534",
      borderRadius: "10px",
      padding: "11px 14px",
      fontSize: "14px",
      fontWeight: 500,
    },

    hero: {
      background: "#fff",
      border: "1px solid #e6eaf2",
      borderRadius: "18px",
      padding: "26px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      boxShadow: "0 5px 20px rgba(15, 23, 42, 0.04)",
      marginBottom: "20px",
    },

    avatar: {
      width: "82px",
      height: "82px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background: "linear-gradient(135deg, #6655f3, #8b5cf6)",
      color: "#fff",
      fontSize: "29px",
      fontWeight: 700,
      boxShadow: "0 8px 22px rgba(99, 102, 241, 0.24)",
    },

    heroInfo: {
      minWidth: 0,
    },

    heroName: {
      margin: "0 0 6px",
      color: "#18233f",
      fontSize: "24px",
      fontWeight: 700,
    },

    heroEmail: {
      margin: 0,
      color: "#64748b",
      fontSize: "14px",
    },

    roleBadge: {
      display: "inline-block",
      marginTop: "10px",
      background: "#f0edff",
      color: "#5b46f1",
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: 600,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "20px",
    },

    card: {
      background: "#fff",
      border: "1px solid #e6eaf2",
      borderRadius: "18px",
      padding: "24px",
      boxShadow: "0 5px 20px rgba(15, 23, 42, 0.035)",
      marginBottom: "20px",
    },

    sectionTitle: {
      margin: 0,
      color: "#18233f",
      fontSize: "19px",
      fontWeight: 700,
    },

    sectionDescription: {
      margin: "6px 0 22px",
      color: "#64748b",
      fontSize: "13px",
      lineHeight: 1.55,
    },

    field: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    fieldFull: {
      gridColumn: "1 / -1",
    },

    label: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      color: "#475569",
      fontSize: "13px",
      fontWeight: 600,
    },

    value: {
      minHeight: "20px",
      color: "#18233f",
      fontSize: "14px",
      lineHeight: 1.6,
      wordBreak: "break-word",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #d8deea",
      borderRadius: "10px",
      padding: "11px 12px",
      outline: "none",
      fontSize: "14px",
      color: "#18233f",
      background: "#fff",
    },

    textarea: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #d8deea",
      borderRadius: "10px",
      padding: "11px 12px",
      outline: "none",
      fontSize: "14px",
      lineHeight: 1.55,
      color: "#18233f",
      background: "#fff",
      resize: "vertical",
      fontFamily: "inherit",
    },

    bio: {
      gridColumn: "1 / -1",
      marginTop: "20px",
    },

    skillEditor: {
      display: "flex",
      gap: "10px",
      marginBottom: "18px",
    },

    addSkillButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      border: "none",
      background: "#eef2ff",
      color: "#4f46e5",
      padding: "0 15px",
      borderRadius: "10px",
      fontWeight: 600,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },

    skills: {
      display: "flex",
      flexWrap: "wrap",
      gap: "9px",
    },

    skill: {
      display: "inline-flex",
      alignItems: "center",
      gap: "7px",
      background: "#f3f1ff",
      color: "#5546b8",
      borderRadius: "999px",
      padding: "7px 11px",
      fontSize: "13px",
      fontWeight: 600,
    },

    removeSkill: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      background: "transparent",
      color: "#6b5ed0",
      padding: 0,
      cursor: "pointer",
    },

    empty: {
      color: "#94a3b8",
      fontSize: "14px",
      margin: 0,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <span style={styles.eyebrow}>Account</span>

            <h1 style={styles.title}>My Profile</h1>

            <p style={styles.description}>
              Manage your personal information and professional
              profile details.
            </p>
          </div>

          <div style={styles.actionGroup}>
            {!editMode ? (
              <button
                type="button"
                style={styles.editButton}
                onClick={() => setEditMode(true)}
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={handleCancel}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  style={styles.saveButton}
                  onClick={handleSave}
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.avatar}>
            {initials}
          </div>

          <div style={styles.heroInfo}>
            <h2 style={styles.heroName}>
              {profile.name || "Your Name"}
            </h2>

            <p style={styles.heroEmail}>
              {profile.email || "No email added"}
            </p>

            {profile.role && (
              <span style={styles.roleBadge}>
                {profile.role}
              </span>
            )}
          </div>
        </section>

        {/* PERSONAL + PROFESSIONAL */}
        <div style={styles.grid}>
          {/* PERSONAL */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Personal Information
            </h2>

            <p style={styles.sectionDescription}>
              Basic information associated with your Forma AI
              account.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div style={styles.field}>
                <label style={styles.label}>
                  <UserRound size={15} />
                  Full Name
                </label>

                {editMode ? (
                  <input
                    style={styles.input}
                    type="text"
                    value={profile.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Enter your name"
                  />
                ) : (
                  <div style={styles.value}>
                    {profile.name || "Not provided"}
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  <Mail size={15} />
                  Email Address
                </label>

                {editMode ? (
                  <input
                    style={styles.input}
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="Enter your email"
                  />
                ) : (
                  <div style={styles.value}>
                    {profile.email || "Not provided"}
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  <Phone size={15} />
                  Phone Number
                </label>

                {editMode ? (
                  <input
                    style={styles.input}
                    type="tel"
                    value={profile.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div style={styles.value}>
                    {profile.phone || "Not provided"}
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  <MapPin size={15} />
                  Location
                </label>

                {editMode ? (
                  <input
                    style={styles.input}
                    type="text"
                    value={profile.location}
                    onChange={(event) =>
                      updateField(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Enter location"
                  />
                ) : (
                  <div style={styles.value}>
                    {profile.location || "Not provided"}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PROFESSIONAL */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Professional Information
            </h2>

            <p style={styles.sectionDescription}>
              Add details about your role, education and
              background.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "20px",
              }}
            >
              <div style={styles.field}>
                <label style={styles.label}>
                  <BriefcaseBusiness size={15} />
                  Role
                </label>

                {editMode ? (
                  <input
                    style={styles.input}
                    type="text"
                    value={profile.role}
                    onChange={(event) =>
                      updateField(
                        "role",
                        event.target.value
                      )
                    }
                    placeholder="Enter your role"
                  />
                ) : (
                  <div style={styles.value}>
                    {profile.role || "Not provided"}
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  <GraduationCap size={15} />
                  Education
                </label>

                {editMode ? (
                  <input
                    style={styles.input}
                    type="text"
                    value={profile.education}
                    onChange={(event) =>
                      updateField(
                        "education",
                        event.target.value
                      )
                    }
                    placeholder="Enter your education"
                  />
                ) : (
                  <div style={styles.value}>
                    {profile.education ||
                      "Not provided"}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.bio}>
              <label style={styles.label}>
                <Code2 size={15} />
                About
              </label>

              <div style={{ marginTop: "8px" }}>
                {editMode ? (
                  <textarea
                    style={styles.textarea}
                    rows={6}
                    value={profile.bio}
                    onChange={(event) =>
                      updateField(
                        "bio",
                        event.target.value
                      )
                    }
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div style={styles.value}>
                    {profile.bio ||
                      "No bio added yet."}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* SKILLS */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Skills</h2>

          <p style={styles.sectionDescription}>
            Add the technologies and skills you want to
            display on your profile.
          </p>

          {editMode && (
            <div style={styles.skillEditor}>
              <input
                style={{
                  ...styles.input,
                  flex: 1,
                }}
                type="text"
                value={skillInput}
                onChange={(event) =>
                  setSkillInput(event.target.value)
                }
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter"
              />

              <button
                type="button"
                style={styles.addSkillButton}
                onClick={addSkill}
              >
                <Plus size={15} />
                Add Skill
              </button>
            </div>
          )}

          <div style={styles.skills}>
            {profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <div
                  key={skill}
                  style={styles.skill}
                >
                  {skill}

                  {editMode && (
                    <button
                      type="button"
                      style={styles.removeSkill}
                      onClick={() =>
                        removeSkill(skill)
                      }
                      aria-label={`Remove ${skill}`}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p style={styles.empty}>
                No skills added yet.
              </p>
            )}
          </div>
        </section>

        {/* BOTTOM SAVE ACTION */}
        {editMode && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingBottom: "20px",
            }}
          >
            <button
              type="button"
              style={styles.cancelButton}
              onClick={handleCancel}
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="button"
              style={styles.saveButton}
              onClick={handleSave}
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;