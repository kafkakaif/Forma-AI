import React from "react";
import { NavLink } from "react-router-dom";

import {
  Home,
  FileText,
  LayoutTemplate,
  Send,
  BarChart3,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";

import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">

      {/* BRAND */}

      <div className="brand">
        <div className="brand-logo">
          F
        </div>

        <span>Forma AI</span>
      </div>

      {/* MAIN NAVIGATION */}

      <nav className="sidebar-nav">

        <NavLink
          to="/dashboard"
          className="nav-item"
        >
          <Home size={19} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/forms"
          className="nav-item"
        >
          <FileText size={19} />
          <span>My Forms</span>
        </NavLink>

        <NavLink
          to="/templates"
          className="nav-item"
        >
          <LayoutTemplate size={19} />
          <span>Templates</span>
        </NavLink>

        <NavLink
          to="/submissions"
          className="nav-item"
        >
          <Send size={19} />
          <span>Submissions</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className="nav-item"
        >
          <BarChart3 size={19} />
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/profile"
          className="nav-item"
        >
          <User size={19} />
          <span>Profile</span>
        </NavLink>

      </nav>

      {/* BOTTOM */}

      <div className="sidebar-bottom">

        <NavLink
          to="/settings"
          className="nav-item"
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <button className="nav-item">
          <HelpCircle size={19} />
          <span>Help & Support</span>
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;