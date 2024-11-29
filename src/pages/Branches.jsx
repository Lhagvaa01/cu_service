import React, { useState, useEffect } from "react";
import { fetchData, postData, updateData } from "../api";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [totalBranches, setTotalBranches] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBranch, setNewBranch] = useState({
    name: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await fetchData("branches");
        const branchCount = await fetchData("branchesCount");
        setBranches(data);
        setTotalBranches(branchCount.total || 0);
      } catch (error) {
        console.error(
          "Салбаруудын мэдээлэл татахад алдаа гарлаа:",
          error.message
        );
      }
    };
    fetchBranches();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchData(`branchesSearch=${searchTerm}`);
      setBranches(data);
    } catch (error) {
      console.error("Хайлт хийхэд алдаа гарлаа:", error.message);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranch.name || !newBranch.phone || !newBranch.address) {
      alert("Бүх талбарыг бөглөнө үү!");
      return;
    }

    try {
      const response = await postData("branchesAdd", newBranch);
      setBranches((prev) => [...prev, response]);
      setTotalBranches((prev) => prev + 1);
      setIsModalOpen(false);
      alert("Шинэ салбар амжилттай нэмэгдлээ!");
    } catch (error) {
      console.error("Салбар нэмэхэд алдаа гарлаа:", error.message);
      alert("Салбар нэмэхэд алдаа гарлаа.");
    }
  };

  const handleEditBranch = async () => {
    if (!editingBranch.name || !editingBranch.phone || !editingBranch.address) {
      alert("Бүх талбарыг бөглөнө үү!");
      return;
    }

    try {
      await updateData("/branchesA", editingBranch.id, editingBranch);
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === editingBranch.id ? editingBranch : branch
        )
      );
      setIsEditModalOpen(false);
      alert("Салбар амжилттай шинэчлэгдлээ!");
    } catch (error) {
      console.error("Салбар засахад алдаа гарлаа:", error.message);
      alert("Салбар засахад алдаа гарлаа.");
    }
  };
  const handleViewMap = (latitude, longitude) => {
    if (latitude && longitude) {
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(mapUrl, "_blank");
    } else {
      alert("Газрын зургийн мэдээлэл байхгүй байна.");
    }
  };

  return (
    <div className="h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Салбарууд</h1>

      {/* Нийт тоо */}
      <div className="mb-4">
        <h2 className="text-lg font-bold">Нийт салбар: {totalBranches}</h2>
      </div>

      {/* Хайх */}
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          placeholder="Салбарын нэрээр хайх"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded mr-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Хайх
        </button>
      </form>

      {/* Шинэ салбар нэмэх */}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mb-6"
        onClick={() => setIsModalOpen(true)}
      >
        Шинэ салбар нэмэх
      </button>

      {/* Салбарын хүснэгт */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Салбарын нэр</th>
            <th className="px-4 py-2">Утас</th>
            <th className="px-4 py-2">Хаяг</th>
            <th className="px-4 py-2">Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td className="border px-4 py-2">{branch.name}</td>
              <td className="border px-4 py-2">{branch.phone}</td>
              <td className="border px-4 py-2">{branch.address}</td>
              <td className="border px-4 py-2 flex gap-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() =>
                    handleViewMap(branch.latitude, branch.longitude)
                  }
                >
                  Газрын зураг харах
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setEditingBranch(branch);
                    setIsEditModalOpen(true);
                  }}
                >
                  Засах
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Засах Modal */}
      {isEditModalOpen && editingBranch && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Салбар засах</h2>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="editName"
              >
                Салбарын нэр:
              </label>
              <input
                id="editName"
                type="text"
                value={editingBranch.name}
                onChange={(e) =>
                  setEditingBranch((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="editPhone"
              >
                Утас:
              </label>
              <input
                id="editPhone"
                type="text"
                value={editingBranch.phone}
                onChange={(e) =>
                  setEditingBranch((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="editAddress"
              >
                Хаяг:
              </label>
              <textarea
                id="editAddress"
                value={editingBranch.address}
                onChange={(e) =>
                  setEditingBranch((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="editLatitude"
              >
                Өргөрөг:
              </label>
              <input
                id="editLatitude"
                type="text"
                value={editingBranch.latitude}
                onChange={(e) =>
                  setEditingBranch((prev) => ({
                    ...prev,
                    latitude: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="editLongitude"
              >
                Уртраг:
              </label>
              <input
                id="editLongitude"
                type="text"
                value={editingBranch.longitude}
                onChange={(e) =>
                  setEditingBranch((prev) => ({
                    ...prev,
                    longitude: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsEditModalOpen(false)}
              >
                Болих
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleEditBranch}
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
