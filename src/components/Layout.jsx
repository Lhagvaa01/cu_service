import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-grow p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default Layout;
