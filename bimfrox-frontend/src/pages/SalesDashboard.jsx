import Sidebar from "../components/Sidebar";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import API from "../api/axios";

function SalesDashboard() {
  const [sales, setSales] = useState([]);
  const [target, setTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const token = localStorage.getItem("token");

  // Responsive
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Fetch sales
  const fetchSales = async () => {
    try {
      const res = await API.get("/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(res.data);
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  };

  // Fetch target
  const fetchTarget = async () => {
    try {
      const res = await API.get("/targets/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTarget(res.data[0]);
    } catch (err) {
      console.error("Error fetching target:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSales();
      fetchTarget();
    }
  }, [token]);

  // ✅ Monthly revenue (WITH CUSTOM PLAN)
  const monthlyRevenue = useMemo(() => {
    const revenue = Array(12).fill(0);

    sales.forEach((s) => {
      if (s.status === "confirmed") {
        const monthIndex = new Date(s.date).getMonth();

        let amount = 0;

        if (s.subscriptionPlan === "other") {
          const customAmount = Number(s.customAmount) || 0;
          const duration = parseInt(s.duration) || 1;
          amount = customAmount * duration;
        } else {
          amount = Number(s.subscriptionPlan) || 0;
        }

        revenue[monthIndex] += amount;
      }
    });

    return revenue;
  }, [sales]);

  const currentMonthRevenue = monthlyRevenue[new Date().getMonth()] || 0;

  // Monthly Target
  const monthlyTarget = target?.targetAmount || 0;

  // Progress
  const progress = monthlyTarget
    ? Math.min((currentMonthRevenue / monthlyTarget) * 100, 100)
    : 0;

  // Summary (Today, Week, Month)
  const salesSummary = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);

    let day = 0,
      week = 0,
      month = 0;

    sales.forEach((s) => {
      const date = new Date(s.date);
      if (date >= todayStart) day++;
      if (date >= weekStart) week++;
      if (date >= monthStart) month++;
    });

    return { day, week, month };
  }, [sales]);

  // Plan counts
  const planCounts = useMemo(() => {
    const counts = { 499: 0, 799: 0, 999: 0 };
    sales.forEach((s) => {
      if (s.status === "confirmed") {
        const plan = Number(s.subscriptionPlan);
        if (counts[plan] !== undefined) counts[plan]++;
      }
    });
    return counts;
  }, [sales]);

  // ✅ STATUS COUNTS
  const statusCounts = useMemo(() => {
    const counts = {
      confirmed: 0,
      rejected: 0,
      pending: 0,
    };

    sales.forEach((s) => {
      if (counts[s.status] !== undefined) {
        counts[s.status]++;
      }
    });

    return counts;
  }, [sales]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-animated opacity-70"></div>

      <Sidebar />

      <div
        className="transition-all duration-300 p-4 sm:p-6 lg:p-8"
        style={{
          marginLeft: isMobile ? "0px" : "260px",
          marginTop: isMobile ? "60px" : "0px",
        }}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-3xl shadow-xl mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Sales Dashboard</h1>
          <p className="opacity-80 text-sm">Manage your sales analytics</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card title="Today" value={salesSummary.day} color="text-green-600" />
          <Card title="Week" value={salesSummary.week} color="text-purple-600" />
          <Card title="Month" value={salesSummary.month} color="text-orange-600" />
          <Card
            title="Revenue"
            value={`₹${currentMonthRevenue}`}
            color="text-blue-600"
          />
          <Card
            title="Pending"
            value={sales.filter((s) => s.status === "pending").length}
            color="text-red-600"
          />

          {/* ✅ NEW STATUS CARDS */}
          <Card title="Confirmed" value={statusCounts.confirmed} color="text-green-600" />
          <Card title="Rejected" value={statusCounts.rejected} color="text-red-600" />
        </div>

        {/* 🎯 Target Section */}
        <div className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-xl mb-6">
          <h2 className="font-semibold mb-2">🎯 Monthly Target</h2>

          {target ? (
            <>
              <p className="text-sm mb-2 text-gray-700">
                {target.month} {target.year}
              </p>

              <div className="w-full bg-gray-300 rounded-full h-5">
                <div
                  className={`h-5 rounded-full text-white text-center text-sm font-bold ${
                    progress >= 100 ? "bg-green-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${progress}%` }}
                >
                  {progress.toFixed(0)}%
                </div>
              </div>

              <p className="text-sm mt-1">
                Target: ₹{monthlyTarget} | Achieved: ₹{currentMonthRevenue}
              </p>
            </>
          ) : (
            <p className="text-gray-500">No target assigned yet</p>
          )}
        </div>

        {/* Plan Performance */}
        <div className="bg-white/20 backdrop-blur-xl p-4 rounded-3xl shadow-xl mb-6">
          <h2 className="font-semibold mb-3">Plan Performance</h2>

          {Object.keys(planCounts).map((plan) => (
            <div key={plan} className="flex justify-between mb-2">
              <span>₹{plan} Plan</span>
              <span>{planCounts[plan]} sales</span>
            </div>
          ))}
        </div>

        {/* Recent Sales */}
        <div className="bg-white/20 backdrop-blur-xl p-4 rounded-3xl shadow-xl">
          <h2 className="font-semibold mb-4 text-lg">Recent Sales</h2>

          {sales.length === 0 ? (
            <p className="text-gray-600">No sales found</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-auto">
              {sales.slice().reverse().map((s, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/30 backdrop-blur-md shadow hover:scale-[1.02] transition"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{s.businessName}</h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        s.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : s.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mt-1">
                    Owner: {s.ownerName}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-blue-600">
                      ₹
                      {s.subscriptionPlan === "other"
                        ? Number(s.customAmount || 0)
                        : Number(s.subscriptionPlan || 0)}
                    </span>

                    <span className="text-sm text-gray-500">
                      {new Date(s.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes gradientBG {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
        .bg-animated {
          background: linear-gradient(-45deg, #e0f2fe, #f0f9ff, #eef2ff, #fdf2f8);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
      `}</style>
    </div>
  );
}

// Card Component
const Card = ({ title, value, color }) => (
  <div className="p-4 rounded-2xl shadow-xl bg-white/20 backdrop-blur-xl hover:scale-105 transition">
    <p className="text-sm opacity-80">{title}</p>
    <h1 className={`text-2xl font-bold ${color}`}>{value}</h1>
  </div>
);

export default SalesDashboard;