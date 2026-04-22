import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axios";

export default function MySales() {
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    contact: "",
    address: "",
    subscriptionPlan: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  const token = localStorage.getItem("token");

  // 🔹 Responsive check
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const fetchSales = async () => {
    try {
      const res = await API.get("/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/sales/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Updated Successfully");
      } else {
        await API.post("/sales", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Added Successfully");
      }
      setForm({ businessName: "", ownerName: "", contact: "", address: "", subscriptionPlan: "" });
      setEditId(null);
      setShowForm(false);
      fetchSales();
    } catch (err) {
      console.log(err);
      alert("Error submitting form");
    }
  };

  const handleEdit = (sale) => {
    setForm({
      businessName: sale.businessName,
      ownerName: sale.ownerName,
      contact: sale.contact,
      address: sale.address,
      subscriptionPlan: sale.subscriptionPlan,
    });
    setEditId(sale._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSales();
    } catch (err) {
      console.log(err);
    }
  };

  const totalRevenue = sales.reduce((acc, curr) => acc + Number(curr.subscriptionPlan || 0), 0);

  return (
    <Layout>
      <div
        className="p-4 sm:p-6 md:p-6 bg-gray-100 min-h-screen space-y-6"
        style={{ paddingTop: isMobile ? "100px" : "20px" }} // ✅ Top space for mobile sidebar/logo
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">My Sales</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl w-full md:w-auto"
          >
            + Add Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p>Total Sales</p>
            <h2 className="text-xl font-bold">{sales.length}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p>Total Revenue</p>
            <h2 className="text-xl font-bold text-green-600">₹{totalRevenue}</h2>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 mt-4">
          {sales.map((s) => (
            <div key={s._id} className="bg-white p-4 rounded-xl shadow flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{s.businessName}</h3>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">₹{s.subscriptionPlan}</span>
              </div>
              <p className="text-gray-600 text-sm"><b>Owner:</b> {s.ownerName}</p>
              <p className="text-gray-600 text-sm">📞 {s.contact}</p>
              <p className="text-gray-600 text-sm">📍 {s.address}</p>
              <p className="text-xs text-gray-500">{new Date(s.date).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(s)} className="flex-1 bg-yellow-400 px-3 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(s._id)} className="flex-1 bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white p-6 rounded-xl shadow overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Your Businesses</h2>
          <table className="w-full min-w-175 text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Business</th>
                <th className="p-2 border">Owner</th>
                <th className="p-2 border">Contact</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Plan</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s._id} className="border-b">
                  <td className="p-2">{s.businessName}</td>
                  <td>{s.ownerName}</td>
                  <td>{s.contact}</td>
                  <td>{s.address}</td>
                  <td className="text-green-600 font-bold">₹{s.subscriptionPlan}</td>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                  <td className="space-x-2">
                    <button onClick={() => handleEdit(s)} className="bg-yellow-400 px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto p-3">
            <div className="bg-white w-full max-w-md md:max-w-lg p-5 rounded-xl relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{editId ? "Edit Business" : "Add Business"}</h2>
                <button onClick={() => { setShowForm(false); setEditId(null); }}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="Business Name" className="w-full border p-2 rounded" required />
                <input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Owner Name" className="w-full border p-2 rounded" required />
                <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact" className="w-full border p-2 rounded" required />
                <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full border p-2 rounded" required />
                <select name="subscriptionPlan" value={form.subscriptionPlan} onChange={handleChange} className="w-full border p-2 rounded" required>
                  <option value="">Select Plan</option>
                  <option value="499">₹499</option>
                  <option value="799">₹799</option>
                  <option value="999">₹999</option>
                </select>
                <button className="w-full bg-blue-600 text-white py-2 rounded">{editId ? "Update" : "Add"}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}