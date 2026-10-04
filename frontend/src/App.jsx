import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

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

/*
 * Protect all application pages.
 * If the user is not logged in, send them to /login.
 * If logged in, render the global Layout and the current page.
 */
function ProtectedLayout() {
  const isLoggedIn =
    localStorage.getItem("forma_logged_in") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            AUTHENTICATION / PUBLIC PAGES
        ====================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Public insurance claim page */}
        <Route
          path="/insurance-claim"
          element={<InsuranceClaim />}
        />

        {/* =====================================================
            PROTECTED APPLICATION
        ====================================================== */}

        <Route element={<ProtectedLayout />}>
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

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>

        {/* =====================================================
            DEFAULT ROUTES
        ====================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;