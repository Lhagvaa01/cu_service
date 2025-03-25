import React, { useState } from "react";
import { Link } from "react-router-dom";
// import {
//   HomeModernIcon,
//   UserCircleIcon,
//   ShoppingCartIcon,
//   ChartBarSquareIcon,
//   Bars3Icon, // Зөв дүрсийг импортлох
// } from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    // {
    //   name: "Удирдах самбар",
    //   path: "/dashboard",
    //   //   icon: <HomeModernIcon className="h-5 w-5" />,
    // },
    {
      name: "Захиалга",
      path: "/orders",
      //   icon: <ShoppingCartIcon className="h-5 w-5" />,
    },
    {
      name: "Салбарууд",
      path: "/branches",
      //   icon: <UserCircleIcon className="h-5 w-5" />,
    },
    // {
    //   name: "Тайлан",
    //   path: "/reports",
    //   //   icon: <ChartBarSquareIcon className="h-5 w-5" />,
    // },
  ];

  return (
    <div
      className={`h-auto bg-gray-800 text-white ${
        isCollapsed ? "w-20" : "w-64"
      } flex flex-col transition-all duration-300`}
    >
      <button
        className="p-4 focus:outline-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {/* <Bars3Icon className="h-6 w-6" /> */}
      </button>
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="hover:bg-gray-700">
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                {item.icon}
                {!isCollapsed && item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
