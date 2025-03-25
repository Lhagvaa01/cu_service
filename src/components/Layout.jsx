import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("user")); // Анх токен авах

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(sessionStorage.getItem("user")); // Токен өөрчлөгдөхөд шинэчлэх
    };

    window.addEventListener("storage", handleStorageChange); // sessionStorage өөрчлөлтийг сонсох

    return () => {
      window.removeEventListener("storage", handleStorageChange); // Цэвэрлэх
    };
  }, []);

  return (
    <div className="flex">
      {token && <Sidebar />}
      <main className="flex-grow p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default Layout;
