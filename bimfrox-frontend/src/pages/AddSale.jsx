import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState("");
  const [description, setDescription] = useState("");

  const [customAmount, setCustomAmount] = useState("");
  const [duration, setDuration] = useState("");

  const [selectedDesc, setSelectedDesc] = useState("");
  const [showDescModal, setShowDescModal] = useState(false);

  const [editingSaleId, setEditingSaleId] = useState(null); // For edit mode

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 10; // change this as needed

  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = sales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(sales.length / salesPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // CSV DOWNLOAD FUNCTION
  const downloadCSV = () => {
    if (!sales.length) return;

    const headers = [
      "Business Name",
      "Owner Name",
      "Contact",
      "Address",
      "Plan",
      "Description",
      "Date",
    ];

    const rows = sales.map((sale) => [
      sale.businessName,
      sale.ownerName,
      sale.contact,
      sale.address,
      sale.subscriptionPlan === "other"
        ? `₹${sale.customAmount} (${sale.duration})`
        : `₹${sale.subscriptionPlan}`,
      sale.description || "",
      new Date(sale.date).toLocaleDateString(),
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.map((item) => `"${item}"`).join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      const token = localStorage.getItem("token");
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

  // Add or Edit Sale
  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        businessName,
        ownerName,
        contact,
        address,
        subscriptionPlan: plan,
        customAmount: plan === "other" ? customAmount : "",
        duration: plan === "other" ? duration : "",
        description: plan === "other" ? description : "",
      };

      if (editingSaleId) {
        await API.put(`/sales/${editingSaleId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert("Project Updated Successfully");
      } else {
        await API.post("/sales", payload, { headers: { Authorization: `Bearer ${token}` } });
        alert("Project Added Successfully");
      }

      // Reset form
      setBusinessName("");
      setOwnerName("");
      setContact("");
      setAddress("");
      setPlan("");
      setDescription("");
      setCustomAmount("");
      setDuration("");
      setEditingSaleId(null);
      setShowForm(false);
      fetchSales();
    } catch (err) {
      console.log(err);
      alert("Error saving project");
    }
  };

  return (
    <Layout>
      <div className="p-3 md:p-6" style={{ marginTop: isMobile ? "60px" : "0px" }}>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-3">
          <h1 className="text-xl md:text-3xl font-bold">My Sales</h1>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={downloadCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg w-full md:w-auto"
            >
              ⬇ Download CSV
            </button>

            <button
              onClick={() => {
                setEditingSaleId(null); // Ensure add mode
                setBusinessName("");
                setOwnerName("");
                setContact("");
                setAddress("");
                setPlan("");
                setDescription("");
                setCustomAmount("");
                setDuration("");
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg w-full md:w-auto"
            >
              + Add New Project
            </button>
          </div>
        </div>

        {/* ADD / EDIT MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
            <div className="bg-white w-full max-w-md md:max-w-lg p-5 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {editingSaleId ? "Edit Project" : "Add Project"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSaleId(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSale} className="space-y-3">
                <input
                  type="text"
                  placeholder="Business Name"
                  className="w-full border p-3 rounded"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Owner Name"
                  className="w-full border p-3 rounded"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Contact"
                  className="w-full border p-3 rounded"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full border p-3 rounded"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                <select
                  className="w-full border p-3 rounded"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  required
                >
                  <option value="">Select Plan</option>
                  <option value="499">₹499</option>
                  <option value="799">₹799</option>
                  <option value="999">₹999</option>
                  <option value="other">Custom Plan</option>
                </select>

                {plan === "other" && (
                  <>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      className="w-full border p-3 rounded"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 3 months)"
                      className="w-full border p-3 rounded"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                    <textarea
                      placeholder="Enter custom requirements..."
                      className="w-full border p-3 rounded"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </>
                )}

                <button className="w-full bg-green-600 text-white py-2 rounded">
                  {editingSaleId ? "Update" : "Save"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DESCRIPTION MODAL */}
        {showDescModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
            <div className="bg-white w-full max-w-md p-5 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Full Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{selectedDesc}</p>
              <button
                onClick={() => setShowDescModal(false)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">My Projects</h2>

          <table className="min-w-full border">
            <thead className="bg-gray-100 text-center">
              <tr>
                <th className="p-2 border">Business</th>
                <th className="p-2 border">Owner</th>
                <th className="p-2 border">Contact</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Plan</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentSales.map((sale) => (
                <tr key={sale._id} className="text-center">
                  <td className="border p-2">{sale.businessName}</td>
                  <td className="border p-2">{sale.ownerName}</td>
                  <td className="border p-2">{sale.contact}</td>
                  <td className="border p-2">{sale.address}</td>
                  <td className="border p-2 text-green-600 font-semibold">
                    {sale.subscriptionPlan === "other"
                      ? `₹${sale.customAmount} (${sale.duration})`
                      : `₹${sale.subscriptionPlan}`}
                  </td>

                  <td className="border p-2">
                    {sale.description
                      ? sale.description.substring(0, 20) + "..."
                      : "-"}
                    {sale.description && (
                      <button
                        onClick={() => {
                          setSelectedDesc(sale.description);
                          setShowDescModal(true);
                        }}
                        className="text-blue-600 ml-2 underline text-sm"
                      >
                        View
                      </button>
                    )}
                  </td>

                  <td className="border p-2">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>

                  <td className="border p-2">
                    <button
                      onClick={() => {
                        setEditingSaleId(sale._id);
                        setBusinessName(sale.businessName);
                        setOwnerName(sale.ownerName);
                        setContact(sale.contact);
                        setAddress(sale.address);
                        setPlan(sale.subscriptionPlan);
                        setCustomAmount(sale.customAmount || "");
                        setDuration(sale.duration || "");
                        setDescription(sale.description || "");
                        setShowForm(true);
                      }}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex gap-2 justify-center mt-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}