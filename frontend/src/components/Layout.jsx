import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  LayoutTemplate,
  Send,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

import "./Layout.css";

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="app-sidebar">

        {/* BRAND */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">F</div>
          <span>Forma AI</span>
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="sidebar-main-nav">

          <NavLink to="/dashboard" className="sidebar-link">
            <Home size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/forms" className="sidebar-link">
            <FileText size={19} />
            <span>My Forms</span>
          </NavLink>

          <NavLink to="/templates" className="sidebar-link">
            <LayoutTemplate size={19} />
            <span>Templates</span>
          </NavLink>

          <NavLink to="/submissions" className="sidebar-link">
            <Send size={19} />
            <span>Submissions</span>
          </NavLink>

          <NavLink to="/analytics" className="sidebar-link">
            <BarChart3 size={19} />
            <span>Analytics</span>
          </NavLink>

        </nav>

        {/* BOTTOM NAVIGATION */}
        <div className="sidebar-bottom">

          <NavLink to="/profile" className="sidebar-link">
            <User size={19} />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/settings" className="sidebar-link">
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <button className="sidebar-link sidebar-button">
            <HelpCircle size={19} />
            <span>Help & Support</span>
          </button>

          <button
            className="sidebar-link sidebar-button logout-link"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* PAGE CONTENT */}
      <main className="app-main">
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;