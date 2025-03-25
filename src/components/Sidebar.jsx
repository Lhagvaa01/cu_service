import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserCircleIcon,
  ShoppingCartIcon,
  ChartBarIcon,
} from "@heroicons/react/outline";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Захиалга",
      path: "/orders",
      icon: <ShoppingCartIcon className="h-5 w-5" />,
    },
    {
      name: "Салбарууд",
      path: "/branches",
      icon: <UserCircleIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div className={`h-screen min-h-screen p-4 bg-gray-900 lg:bg-white`}>
      <div className="flex pl-5 text-white lg:text-black">KACC.MN</div>
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-md text-white lg:text-black hover:bg-gray-200 ${
                  location.pathname === item.path ? "bg-gray-500" : ""
                }`}
                onClick={() => {
                  // Mobile дээр sidebar автоматаар хаагдах
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
              >
                {item.icon}
                <span
                  className={`${isSidebarOpen ? "inline" : "hidden"} lg:inline`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
