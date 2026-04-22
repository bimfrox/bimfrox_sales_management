import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios"; // ✅ use existing configured API

function SalespersonProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "",
    email: "",
    phone: ""
  });

  const [isMobile, setIsMobile] = useState(false);

  // 🔹 Responsive check
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // 🔹 Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await API.get("/auth/profile");

      setUser(res.data);

      setForm({
        name: res.data.name || res.data.username || "",
        city: res.data.city || "",
        email: res.data.email || "",
        phone: res.data.phone || ""
      });

    } catch (err) {
      console.error(err);
      alert("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔹 Input handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Update profile
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await API.put("/auth/profile", form);

      setUser(res.data);
      setEditing(false);

      alert("Profile updated");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete profile
  const handleDelete = async () => {
    if (!window.confirm("⚠️ This action cannot be undone. Delete profile?")) return;

    try {
      setLoading(true);

      await API.delete("/auth/profile");

      localStorage.removeItem("token");

      alert("Profile deleted");

      window.location.href = "/";

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Loading state
  if (loading && !user) {
    return (
      <Layout>
        <div className="p-6 text-center text-gray-500 animate-pulse">
          Loading profile...
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div
        className="p-4 md:p-6 max-w-4xl mx-auto space-y-6"
        style={{ paddingTop: isMobile ? "100px" : "20px" }}
      >
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
          My Profile
        </h1>

        {/* PROFILE CARD */}
        <div className="bg-white shadow-md rounded-xl p-4 md:p-6 space-y-4">

          {editing ? (
            <div className="space-y-3">

              <input
                type="text"
                name="name"
                value={form.name}   // ✅ FIXED
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-2 border rounded-md"
              />

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-2 border rounded-md"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                className="w-full p-2 border rounded-md bg-gray-100"
              />

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full p-2 border rounded-md"
              />

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-2">
              <p><b>Name:</b> {user.name || user.username}</p>
              <p><b>City:</b> {user.city || "-"}</p>
              <p><b>Email:</b> {user.email || "-"}</p>
              <p><b>Phone:</b> {user.phone || "-"}</p>
              <p><b>Role:</b> {user.role}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

        </div>

        {/* PROJECTS */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Projects
          </h2>

          {user.projects?.length > 0 ? (
            <>
              {/* MOBILE */}
              <div className="md:hidden space-y-3">
                {user.projects.map((p, i) => (
                  <div key={i} className="bg-white shadow rounded-xl p-4">
                    <p><b>Project:</b> {p.projectName}</p>
                    <p><b>Client:</b> {p.client || "-"}</p>
                    <p><b>Amount:</b> ₹{p.amount || "-"}</p>
                    <p className="text-gray-500 text-sm">
                      {p.date ? new Date(p.date).toLocaleDateString() : "-"}
                    </p>
                  </div>
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block overflow-x-auto rounded-lg border">
                <table className="min-w-full text-sm md:text-base">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-2">Project</th>
                      <th className="p-2">Client</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.projects.map((p, i) => (
                      <tr key={i} className="border-t text-center">
                        <td className="p-2">{p.projectName}</td>
                        <td className="p-2">{p.client || "-"}</td>
                        <td className="p-2">₹{p.amount || "-"}</td>
                        <td className="p-2">
                          {p.date ? new Date(p.date).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-gray-500 mt-2">No projects found</p>
          )}
        </div>

      </div>
    </Layout>
  );
}

export default SalespersonProfile;