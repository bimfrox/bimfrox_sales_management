import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import PendingRequests from "./pages/PendingRequests";
import AddUser from "./pages/AddUser";
import SalesList from "./pages/SalesList";
import AdminTargets from "./pages/AdminTargets";

import SalesDashboard from "./pages/SalesDashboard";
import AddSale from "./pages/AddSale";
import MySales from "./pages/MySales";
import SalespersonProfile from "./pages/SalespersonProfile";

function App() {
  return (
    <Router>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/pending-requests" element={<PendingRequests />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/sales" element={<SalesList />} />
        <Route path="/admin-targets" element={<AdminTargets />} />

        {/* SALES PERSON */}
        <Route path="/sales-dashboard" element={<SalesDashboard />} />
        <Route path="/add-sale" element={<AddSale />} />
        <Route path="/sales" element={<MySales />} />
        <Route path="/profile" element={<SalespersonProfile />} />
      </Routes>
    </Router>
  );
}

export default App;