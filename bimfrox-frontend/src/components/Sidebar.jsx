import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/BIMFROX.png";

import {
  FaHome,
  FaUserTie,
  FaBars,
  FaPlusCircle,
  FaUser,
  FaBullseye,
} from "react-icons/fa";
import { MdLogout } from "react-icons/md";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpen(!mobile);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // 🔥 MENU ITEMS UPDATED
  const menuItems =
    role === "admin"
      ? [
          { path: "/admin-dashboard", label: "Dashboard", icon: <FaHome /> },
          { path: "/add-user", label: "Add Salesperson", icon: <FaPlusCircle /> },
          { path: "/sales", label: "All Sales", icon: <FaUserTie /> },

          // 🎯 NEW TARGET PAGE
          { path: "/admin-targets", label: "Assign Target", icon: <FaBullseye /> },
        ]
      : [
          { path: "/sales-dashboard", label: "Dashboard", icon: <FaHome /> },
          { path: "/add-sale", label: "Add Sale", icon: <FaPlusCircle /> },
          { path: "/sales", label: "My Sales", icon: <FaUserTie /> },
          { path: "/profile", label: "Profile", icon: <FaUser /> },
        ];

  return (
    <>
      {/* MOBILE HEADER */}
      {isMobile && !open && (
        <div className="fixed top-0 left-0 w-full h-14 bg-blue-900 flex items-center px-4 z-1001">
          <img
            src={logo}
            alt="logo"
            onClick={() => setOpen(true)}
            className="h-10 w-10 bg-white p-1 rounded cursor-pointer"
          />
          <span className="text-white ml-3 font-bold">BIMFROX</span>
        </div>
      )}

      {/* OVERLAY */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-998"
        />
      )}

      {/* SIDEBAR */}
      <div
        className="fixed top-0 left-0 h-screen bg-linear-to-b from-blue-500 to-blue-900 text-white flex flex-col justify-between p-4 z-999 transition-all duration-300"
        style={{
          width: open ? "260px" : "80px",
          left: isMobile ? (open ? "0" : "-260px") : "0",
        }}
      >
        <div>
          {/* Toggle Button */}
          {!isMobile && (
            <div className="flex justify-end mb-2">
              <FaBars
                onClick={() => setOpen(!open)}
                className="cursor-pointer"
              />
            </div>
          )}

          {/* Logo */}
          <div className="text-center mb-5">
            <img
              src={logo}
              alt="logo"
              className={`${open ? "w-16" : "w-10"} mx-auto`}
            />
            {open && <p className="mt-2 font-bold">BIMFROX</p>}
          </div>

          {/* MENU */}
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center ${
                  open ? "gap-3 px-4" : "justify-center"
                } py-3 mb-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-blue-900 text-white shadow-lg"
                    : "bg-white/10 text-blue-100 hover:bg-white/20"
                }`
              }
              onClick={() => isMobile && setOpen(false)}
            >
              {item.icon}
              {open && item.label}
            </NavLink>
          ))}
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="bg-blue-800 py-2 rounded-full flex items-center justify-center gap-2 hover:bg-blue-700 transition"
        >
          <MdLogout />
          {open && "Logout"}
        </button>
      </div>
    </>
  );
};

export default Sidebar;