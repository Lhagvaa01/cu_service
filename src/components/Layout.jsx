import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FaBars } from "react-icons/fa";

const Layout = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("user"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedSidebarState = localStorage.getItem("sidebarState");
    if (storedSidebarState) {
      setIsSidebarOpen(storedSidebarState === "open");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("sidebarState", newState ? "open" : "closed");
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        setToken(sessionStorage.getItem("user"));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {token && (
        <>
          {/* Top Header Bar with Toggle Button */}
          <div className="fixed top-0 left-0 right-0 h-16 bg-gray-800 flex items-center justify-between px-4 z-20 lg:hidden">
            <button className="p-2 text-white" onClick={toggleSidebar}>
              <FaBars size={24} />
            </button>
            {/* Add your header content here if needed */}
            <div></div> {/* Empty div for flex spacing */}
          </div>

          {/* Sidebar Overlay (Mobile only) */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-gray-800 bg-opacity-50 z-10 lg:hidden"
              onClick={toggleSidebar}
            />
          )}

          {/* Sidebar */}
          <div
            className={`fixed  lg:static z-20 h-full ${
              isSidebarOpen ? "block" : "hidden"
            } lg:block`}
            style={{
              top: token ? "64px" : "0",
              height: token ? "calc(100vh - 64px)" : "100vh",
            }}
          >
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <main
        className={`flex-grow p-6 bg-gray-100 min-h-screen ${
          isSidebarOpen && token ? "ml-0 lg:ml-64" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
