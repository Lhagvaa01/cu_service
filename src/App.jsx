import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Branches from "./pages/Branches";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import PasswordChangeForm from "./pages/PassChange";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Логин хуудас */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />

          {/* Хамгаалагдсан хуудсууд */}
          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/branches"
            element={
              <ProtectedRoute>
                <Branches />
              </ProtectedRoute>
            }
          />

          <Route
            path="/passchange"
            element={
              <ProtectedRoute>
                <PasswordChangeForm />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
