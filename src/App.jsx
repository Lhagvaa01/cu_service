import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Branches from "./pages/Branches";
import Reports from "./pages/Reports";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
