import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import API from "../api/axios";

function AddUser() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const perPage = 5;
  const token = localStorage.getItem("token");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load users
  const loadData = async () => {
    if (!token) return;
    try {
      const [pendingRes, usersRes] = await Promise.all([
        API.get("/auth/pending-users", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/auth/users", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPendingUsers(pendingRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to load users");
    }
  };

  useEffect(() => { loadData(); }, []);

  // Approve / Reject / Delete
  const approveUser = async (id) => {
    try {
      await API.put(`/auth/approve-user/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("User approved");
      loadData();
    } catch (err) { console.error(err.response?.data || err.message); }
  };

  const rejectUser = async (id) => {
    try {
      await API.put(`/auth/reject-user/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("User rejected");
      loadData();
    } catch (err) { console.error(err.response?.data || err.message); }
  };

  const deleteUser = async (id) => {
  if (!window.confirm("Delete this user?")) return;
  try {
    await API.delete(`/auth/users/${id}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    alert("User deleted");
    loadData(); // reload users after deletion
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};


  // Filter & paginate
  const filteredUsers = useMemo(() =>
    users.filter(u => u.username.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [users, debouncedSearch]
  );

  const totalPages = Math.ceil(filteredUsers.length / perPage);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredUsers.slice(start, start + perPage);
  }, [filteredUsers, page]);

  useEffect(() => setPage(1), [debouncedSearch]);

  return (
    <Layout>
      <div className="p-6 md:p-10 bg-[#eef2ff] min-h-screen">

        {/* Pending Requests */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Pending Sales Requests</h2>
        {pendingUsers.length === 0 ? <p className="text-gray-500">No pending requests</p> :
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
            <table className="min-w-full text-left">
              <thead className="bg-blue-600 text-white">
                <tr><th className="p-4">Username</th><th className="p-4">Role</th><th className="p-4">Action</th></tr>
              </thead>
              <tbody>
                {pendingUsers.map(u => (
                  <tr key={u._id} className="border-b hover:bg-blue-50">
                    <td className="p-4">{u.username}</td>
                    <td className="p-4">{u.role}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => approveUser(u._id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg">Accept</button>
                      <button onClick={() => rejectUser(u._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }

        {/* Search */}
        <div className="mb-6">
          <input type="text" placeholder="Search salesperson..." value={search} onChange={e => setSearch(e.target.value)} className="bg-white border shadow px-4 py-2 rounded-xl w-72 outline-none" />
        </div>

        {/* Users Table */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Sales Persons</h2>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-blue-600 text-white">
              <tr><th className="p-4">Username</th><th className="p-4">Role</th><th className="p-4">Action</th></tr>
            </thead>
            <tbody>
              {paginatedUsers.map(u => (
                <tr key={u._id} className="border-b hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                  <td className="p-4">{u.username}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    <button onClick={e => { e.stopPropagation(); deleteUser(u._id); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-4 py-1 rounded-lg ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>{i + 1}</button>
          ))}
        </div>

        {/* Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-80">
              <h3 className="text-xl font-bold mb-4 text-blue-700">Sales Person Profile</h3>
              <p><strong>Username:</strong> {selectedUser.username}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Email:</strong> {selectedUser.email || "N/A"}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || "N/A"}</p>
              <p><strong>City:</strong> {selectedUser.city || "N/A"}</p>
              <button onClick={() => setSelectedUser(null)} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg w-full">Close</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AddUser;