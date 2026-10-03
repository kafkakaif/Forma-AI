import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MyForms from "./pages/MyForms";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import InsuranceClaim from "./pages/InsuranceClaim";
import Analytics from "./pages/Analytics";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import Submissions from "./pages/Submissions";

import Layout from "./components/Layout";
import AIInput from "./pages/AIInput";
import GeneratedForm from "./pages/GeneratedForm";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================= AUTHENTICATION ================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/insurance-claim" element={<InsuranceClaim />} />

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
            path="/ai-input"
            element={<AIInput />}
          />

          <Route
            path="/generated-form"
            element={<GeneratedForm />}
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
  element={<MyForms />}
/>

          <Route
            path="/templates"
            element={<Templates />}
          />

          <Route
            path="/submissions"
            element={<Submissions />}
          />

          <Route
  path="/analytics"
  element={<Analytics />}
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