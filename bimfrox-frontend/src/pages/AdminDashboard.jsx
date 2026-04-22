import Layout from "../components/Layout";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import  API  from "../api/axios";

import {
  ComposedChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, u, s] = await Promise.all([
          API.get("/auth/pending-users", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          API.get("/auth/users", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          API.get("/sales", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setPendingUsers(p.data);
        setUsers(u.data);
        setSales(s.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
        console.error(err);
      }
    };

    if (token) fetchData();
  }, [token, navigate]);

  // ✅ TIME FILTER
  const timeFilteredSales = useMemo(() => {
    const now = new Date();

    return sales.filter(s => {
      if (!s.date) return false;

      const d = new Date(s.date);

      if (timeFilter === "today") {
        return d.toDateString() === now.toDateString();
      }

      if (timeFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }

      if (timeFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return d >= monthAgo;
      }

      return true;
    });
  }, [sales, timeFilter]);

  // ✅ STATUS COUNT
  const statusCount = useMemo(() => {
    let confirmed = 0, pending = 0, rejected = 0;

    timeFilteredSales.forEach(s => {
      if (s.status === "confirmed") confirmed++;
      else if (s.status === "pending") pending++;
      else rejected++;
    });

    return { confirmed, pending, rejected };
  }, [timeFilteredSales]);

  // ✅ TOTAL REVENUE
  const totalRevenue = useMemo(() => {
    return timeFilteredSales.reduce((sum, s) => {
      if (s.status !== "confirmed") return sum;

      let monthlyPrice = 0;

      if (s.subscriptionPlan === "other") {
        monthlyPrice = Number(s.customAmount) || 0; // ✅ custom plan
      } else {
        monthlyPrice = Number(s.subscriptionPlan) || 0; // ✅ normal plan
      }

      return sum + monthlyPrice * 12; // yearly revenue
    }, 0);
  }, [timeFilteredSales]);

  // ✅ CHART DATA (ONLY PAST REVENUE)
  const chartData = useMemo(() => {
    const grouped = {};

    timeFilteredSales
      .filter(s => s.status === "confirmed")
      .forEach(s => {
        if (!s.date) return;

        const d = new Date(s.date);
        const key = d.toLocaleDateString("en-CA"); // local date grouping yyyy-mm-dd

        if (!grouped[key]) {
          grouped[key] = { date: new Date(d), revenue: 0 };
        }

        const monthlyPrice = s.subscriptionPlan === "other"
          ? Number(s.customAmount) || 0 // ✅ custom plan
          : Number(s.subscriptionPlan) || 0; // ✅ normal plan

        grouped[key].revenue += monthlyPrice * 12;
      });

    return Object.values(grouped)
      .sort((a, b) => a.date - b.date)
      .map(item => ({
        date: item.date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short"
        }),
        revenue: item.revenue
      }));
  }, [timeFilteredSales]);

  return (
    <Layout>
      <div className="p-4 md:p-10 bg-linear-to-br from-blue-50 to-indigo-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">
            Admin Dashboard 🚀
          </h1>

          <div className="flex gap-2 flex-wrap">
            {["all", "today", "week", "month"].map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1 rounded ${
                  timeFilter === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS CARDS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card title="Confirmed" value={statusCount.confirmed} color="green" />
          <Card title="Pending" value={statusCount.pending} color="yellow" />
          <Card title="Rejected" value={statusCount.rejected} color="red" />
        </div>

        {/* KPI CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card title="Revenue" value={`₹${totalRevenue}`} color="green" />
          <Card title="Sales" value={timeFilteredSales.length} />
          <Card title="Salespersons" value={users.length} />
          <Card title="Pending Users" value={pendingUsers.length} color="red" />
        </div>

        {/* REVENUE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="mb-4 font-semibold">Revenue (Past Data)</h2>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar
                dataKey="revenue"
                fill="#3b82f6"
                name="Revenue"
                radius={[6, 6, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </div>
    </Layout>
  );
}

// ✅ CARD COMPONENT
const Card = ({ title, value, color }) => {
  const colorMap = {
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600"
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow text-center hover:scale-105 transition">
      <p>{title}</p>
      <h1 className={`text-2xl font-bold ${colorMap[color] || ""}`}>
        {value}
      </h1>
    </div>
  );
}; 