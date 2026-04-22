import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Content (ONLY THIS SCROLLS) */}
      <div className="flex-1 md:ml-65 overflow-y-auto">
        {children}
      </div>

    </div>
  );
};

export default Layout;