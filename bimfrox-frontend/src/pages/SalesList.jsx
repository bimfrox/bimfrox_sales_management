import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import API from "../api/axios";

function SalesList() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [editSale, setEditSale] = useState(null);

  const itemsPerPage = 10;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch
  const fetchSales = async () => {
    try {
      const { data } = await API.get("/sales", {   // ✅ FIX
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Update status
  const updateSaleStatus = async (id, status) => {
    try {
      await API.put(
        `/sales/${status}/${id}`,   // ✅ FIX
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Sale
  const handleUpdateSale = async () => {
    try {
      const {
        businessName,
        ownerName,
        subscriptionPlan,
        customAmount,
        duration,
        description,
      } = editSale;

      await API.put(
        `/sales/${editSale._id}`,   // ✅ FIX
        {
          businessName,
          ownerName,
          subscriptionPlan,
          customAmount,
          duration,
          description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditSale(null);
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter
  const filteredSales = useMemo(() => {
    if (!debouncedSearch) return sales;

    const searchLower = debouncedSearch.toLowerCase();

    return sales.filter((s) =>
      s.businessName?.toLowerCase().includes(searchLower) ||
      s.ownerName?.toLowerCase().includes(searchLower) ||
      s.salespersonId?.username?.toLowerCase().includes(searchLower) ||
      s.description?.toLowerCase().includes(searchLower)
    );
  }, [sales, debouncedSearch]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const currentSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  // CSV
  const downloadCSV = () => {
    const headers = [
      "Salesperson",
      "Business",
      "Owner",
      "Plan",
      "Description",
      "Date",
      "Status",
    ];

    const rows = filteredSales.map((s) => [
      s.salespersonId?.username || "",
      s.businessName || "",
      s.ownerName || "",
      s.subscriptionPlan === "other"
        ? `₹${s.customAmount} (${s.duration})`
        : `₹${s.subscriptionPlan}`,
      s.description || "",
      new Date(s.date).toLocaleDateString(),
      s.status || "",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sales_list.csv";
    link.click();
  };

  return (
    <Layout>
      <div className="p-3 sm:p-4 md:p-8 bg-gray-100 min-h-screen pt-16 md:pt-20">

        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Sales List
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded text-sm sm:text-base"
          />
          <button
            onClick={downloadCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm sm:text-base"
          >
            Download CSV
          </button>
        </div>

        {/* Table */}
<div className="bg-white rounded shadow overflow-x-auto">
  <table className="w-full text-sm md:text-base border-collapse">

    <thead className="bg-blue-600 text-white">
      <tr>
        <th className="px-4 py-3 text-left whitespace-nowrap">Salesperson</th>
        <th className="px-4 py-3 text-left whitespace-nowrap">Business</th>
        <th className="px-4 py-3 text-left whitespace-nowrap">Owner</th>
        <th className="px-4 py-3 text-left whitespace-nowrap">Contact</th>
        <th className="px-4 py-3 text-left whitespace-nowrap">Plan</th>
        <th className="px-4 py-3 text-left min-w-50">Description</th>
        <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
        <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
        <th className="px-4 py-3 text-left whitespace-nowrap">Action</th>
      </tr>
    </thead>

    <tbody>
      {currentSales.map((s) => (
        <tr key={s._id} className="border-b hover:bg-gray-50">

          <td
            className="px-4 py-3 text-blue-600 underline cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedSalesperson(s.salespersonId)}
          >
            {s.salespersonId?.username}
          </td>

          <td className="px-4 py-3 whitespace-nowrap">{s.businessName}</td>
          <td className="px-4 py-3 whitespace-nowrap">{s.ownerName}</td>
          <td className="px-4 py-3 whitespace-nowrap">{s.contact}</td>

          <td className="px-4 py-3 whitespace-nowrap">
            {s.subscriptionPlan === "other"
              ? `₹${s.customAmount} (${s.duration})`
              : `₹${s.subscriptionPlan}`}
          </td>

          <td className="px-4 py-3 max-w-62.5 wrap-break-words">
            {s.description?.length > 40 ? (
              <>
                {s.description.slice(0, 40)}...
                <button
                  onClick={() => setSelectedDescription(s.description)}
                  className="text-blue-600 ml-1 underline"
                >
                  View
                </button>
              </>
            ) : (
              s.description || "-"
            )}
          </td>

          <td className="px-4 py-3 whitespace-nowrap">
            {new Date(s.date).toLocaleDateString()}
          </td>

          <td className="px-4 py-3 whitespace-nowrap">
            <span
              className={`text-xs px-2 py-1 rounded ${
                s.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : s.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {s.status}
            </span>
          </td>

          <td className="px-4 py-3 flex flex-wrap gap-2 whitespace-nowrap">
            {role === "admin" && (
              <button
                onClick={() => setEditSale(s)}
                className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
              >
                Edit
              </button>
            )}

            {role === "admin" && s.status === "pending" && (
              <>
                <button
                  onClick={() => updateSaleStatus(s._id, "confirm")}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                >
                  ✔
                </button>
                <button
                  onClick={() => updateSaleStatus(s._id, "reject")}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  ✖
                </button>
              </>
            )}
          </td>

        </tr>
      ))}
    </tbody>
  </table>
</div>

        {/* Pagination */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Salesperson Modal */}
        {selectedSalesperson && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3">
            <div className="bg-white p-5 rounded shadow-lg w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Salesperson Details</h2>
              <p>Name: {selectedSalesperson.username}</p>
              <p>Email: {selectedSalesperson.email}</p>
              <p>Phone: {selectedSalesperson.phone}</p>
              <p>City: {selectedSalesperson.city}</p>

              <button
                onClick={() => setSelectedSalesperson(null)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Description Modal */}
        {selectedDescription && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3">
            <div className="bg-white p-5 rounded shadow-lg w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Full Description</h2>
              <p>{selectedDescription}</p>

              <button
                onClick={() => setSelectedDescription(null)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editSale && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-3">
            <div className="bg-white p-5 rounded w-full max-w-md">

              <h2 className="text-lg font-bold mb-3">Edit Sale</h2>

              <input
                value={editSale.businessName}
                onChange={(e) =>
                  setEditSale({ ...editSale, businessName: e.target.value })
                }
                className="w-full border p-2 mb-2"
              />

              <input
                value={editSale.ownerName}
                onChange={(e) =>
                  setEditSale({ ...editSale, ownerName: e.target.value })
                }
                className="w-full border p-2 mb-2"
              />

              <select
                value={editSale.subscriptionPlan}
                onChange={(e) =>
                  setEditSale({
                    ...editSale,
                    subscriptionPlan: e.target.value,
                  })
                }
                className="w-full border p-2 mb-2"
              >
                <option value="499">₹499</option>
                <option value="799">₹799</option>
                <option value="999">₹999</option>
                <option value="other">Custom Plan</option>
              </select>

              {editSale.subscriptionPlan === "other" && (
                <>
                  <input
                    placeholder="Amount"
                    value={editSale.customAmount || ""}
                    onChange={(e) =>
                      setEditSale({ ...editSale, customAmount: e.target.value })
                    }
                    className="w-full border p-2 mb-2"
                  />
                  <input
                    placeholder="Duration"
                    value={editSale.duration || ""}
                    onChange={(e) =>
                      setEditSale({ ...editSale, duration: e.target.value })
                    }
                    className="w-full border p-2 mb-2"
                  />
                </>
              )}

              <textarea
                value={editSale.description}
                onChange={(e) =>
                  setEditSale({
                    ...editSale,
                    description: e.target.value,
                  })
                }
                className="w-full border p-2 mb-2"
              />

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleUpdateSale}
                  className="bg-green-600 text-white px-3 py-2 rounded w-full"
                >
                  Update
                </button>

                <button
                  onClick={() => setEditSale(null)}
                  className="bg-gray-400 text-white px-3 py-2 rounded w-full"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default SalesList;