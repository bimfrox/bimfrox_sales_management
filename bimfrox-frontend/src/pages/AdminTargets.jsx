import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import  API  from "../api/axios";

export default function AdminTargets() {
  const [targets, setTargets] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [form, setForm] = useState({
    salespersonId: "",
    targetAmount: "",
    month: "",
    year: new Date().getFullYear(),
  });

  const token = localStorage.getItem("token");
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  useEffect(() => {
    fetchTargets();
    fetchSalespersons();
  }, []);

  const fetchTargets = async () => {
    try {
      const res = await API.get("/targets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTargets(res.data);
    } catch (err) {
      console.error(err);
      setTargets([]);
    }
  };

  const fetchSalespersons = async () => {
    try {
      const res = await API.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalespersons(res.data);
    } catch (err) {
      console.error(err);
      setSalespersons([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.salespersonId || !form.targetAmount || !form.month) {
      alert("Fill all fields");
      return;
    }
    try {
      await API.post("/targets", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Target Assigned ✅");
      setForm({
        salespersonId: "",
        targetAmount: "",
        month: "",
        year: new Date().getFullYear(),
      });
      fetchTargets();
    } catch (err) {
      console.error(err);
      alert("Failed to assign target");
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">🎯 Assign Sales Target</h2>

        <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6">
          <select
            value={form.salespersonId}
            onChange={(e) => setForm({ ...form, salespersonId: e.target.value })}
            required
            className="border p-2 w-full mb-3"
          >
            <option value="">Select Salesperson</option>
            {salespersons.map((sp) => (
              <option key={sp._id} value={sp._id}>
                {sp.username || "Unnamed"}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Target Amount"
            value={form.targetAmount}
            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
            className="border p-2 w-full mb-3"
            required
          />

          <select
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            required
            className="border p-2 w-full mb-3"
          >
            <option value="">Select Month</option>
            {monthNames.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Assign Target
          </button>
        </form>

        <div className="bg-white shadow p-4 rounded overflow-x-auto">
          <h3 className="text-xl mb-3">📊 All Targets</h3>
          <table className="w-full border text-center min-w-125">
            <thead>
              <tr className="bg-gray-200">
                <th>Name</th>
                <th>Target</th>
                <th>Achieved</th>
                <th>Month</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {targets.length > 0 ? (
                targets.map((t) => (
                  <tr key={t._id} className="border-t">
                    <td>{t.salespersonId?.username || "Unknown"}</td>
                    <td>₹{t.targetAmount}</td>
                    <td>₹{t.achieved}</td>
                    <td>{t.month}</td>
                    <td>{t.year}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-gray-500 py-4">
                    No targets assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}