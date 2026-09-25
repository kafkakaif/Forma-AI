import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import Layout from "./components/Layout";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================= AUTHENTICATION ================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* ================= APPLICATION ================= */}

        <Route element={<Layout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* Team Pages */}
          <Route
            path="/forms"
            element={
              <div style={{ padding: "40px" }}>
                Forms page will be connected here.
              </div>
            }
          />

          <Route
            path="/templates"
            element={
              <div style={{ padding: "40px" }}>
                Templates page will be connected here.
              </div>
            }
          />

          <Route
            path="/submissions"
            element={
              <div style={{ padding: "40px" }}>
                Submissions page will be connected here.
              </div>
            }
          />

          <Route
            path="/analytics"
            element={
              <div style={{ padding: "40px" }}>
                Analytics page will be connected here.
              </div>
            }
          />

        </Route>

        {/* ================= DEFAULT ================= */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;