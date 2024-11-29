import React, { useEffect, useState } from "react";
import { fetchData, postData } from "../api";
import Table from "../components/Table";

const Orders = () => {
  const API_URL = "http://202.131.237.185:8051/";
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    user: 1, // Default хэрэглэгч ID
    infoCUBranch: "",
    totalPrice: 0,
    description: "",
    isPay: false,
    status: "pending",
    product_details: [],
  });

  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({
    product: "",
    quantity: 1,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const ordersData = await fetchData("histories");
        const branchesData = await fetchData("branches");
        const productsData = await fetchData("products");

        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setBranches(branchesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Алдаа гарлаа:", error.message);
      }
    };
    fetchInitialData();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    if (value) {
      setFilteredOrders(orders.filter((order) => order.status === value));
    } else {
      setFilteredOrders(orders);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetchData(`histories/dtl/${orderId}`);
      setSelectedOrder(response);
    } catch (error) {
      console.error("Захиалгын мэдээлэл татахад алдаа гарлаа:", error.message);
    }
  };

  const handleRowView = (order) => {
    fetchOrderDetails(order.id);
    setIsViewModalOpen(true);
  };

  const handleRowEdit = (order) => {
    // setSelectedOrder(order);
    fetchOrderDetails(order.id);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    const product = products.find(
      (p) => p.id === parseInt(selectedProduct.product)
    );
    if (product) {
      const newProduct = {
        product_id: product.id,
        productName: product.itemName,
        quantity: selectedProduct.quantity,
        subtotal: product.itemPrice * selectedProduct.quantity,
      };

      setNewOrder((prev) => ({
        ...prev,
        product_details: [...prev.product_details, newProduct],
        totalPrice: (prev.totalPrice || 0) + newProduct.subtotal,
      }));
    }
  };

  const handleAddOrder = async () => {
    if (!newOrder.infoCUBranch) {
      alert("Салбарыг сонгоно уу!");
      return;
    }

    try {
      const response = await postData("histories", newOrder);
      setOrders((prev) => [...prev, response]);
      setFilteredOrders((prev) => [...prev, response]);
      setIsModalOpen(false); // Modal цонхыг хаах
      alert("Шинэ захиалга амжилттай нэмэгдлээ!");
    } catch (error) {
      console.error("Алдаа гарлаа:", error.message);
      alert("Захиалга нэмэхэд алдаа гарлаа.");
    }
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    resolved: orders.filter((order) => order.status === "resolved").length,
    on_call: orders.filter((order) => order.status === "on_call").length,
  };

  return (
    <div className="h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Захиалга</h1>

      {/* Тоон үзүүлэлт */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-bold">Нийт захиалга</h2>
          <p>{orderStats.total}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-bold">Хүлээгдэж буй</h2>
          <p>{orderStats.pending}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-bold">Шийдэгдсэн</h2>
          <p>{orderStats.resolved}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow">
          <h2 className="text-lg font-bold">Дуудлагаар</h2>
          <p>{orderStats.on_call}</p>
        </div>
      </div>

      {/* Төлөвөөр шүүх */}
      <div className="mb-4">
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="statusFilter"
        >
          Төлөвөөр шүүх:
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">Бүгд</option>
          <option value="pending">Хүлээгдэж буй</option>
          <option value="resolved">Шийдэгдсэн</option>
          <option value="on_call">Дуудлагаар</option>
        </select>
      </div>

      {/* Шинэ захиалга нэмэх товч */}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mb-6"
        onClick={() => setIsModalOpen(true)}
      >
        Шинэ захиалга нэмэх
      </button>

      {/* Захиалгын хүснэгт */}
      <Table
        headers={["ID", "Хэрэглэгч", "Салбар", "Нийт үнэ", "Төлөв", "Үйлдэл"]}
        rows={filteredOrders.map((order) => [
          order.id,
          order.user,
          order.infoCUBranch,
          order.totalPrice,
          order.status,
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => handleRowView(order)}
            >
              Харах
            </button>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              onClick={() => handleRowEdit(order)}
            >
              Засах
            </button>
          </div>,
        ])}
      />

      {/* Modal Цонх */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Шинэ захиалга</h2>

            {/* Салбар сонгох */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="branch"
              >
                Салбар сонгох:
              </label>
              <select
                id="branch"
                className="border p-2 rounded w-full"
                value={newOrder.infoCUBranch}
                onChange={(e) => {
                  const updatedBranch = e.target.value;
                  setNewOrder((prev) => ({
                    ...prev,
                    infoCUBranch: updatedBranch,
                  }));
                  console.log(updatedBranch);
                }}
              >
                <option value="">Салбар сонгоно уу</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Бараа нэмэх */}
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Бараа нэмэх:</h3>
              <div className="flex items-center gap-4">
                <select
                  className="border p-2 rounded"
                  value={selectedProduct.product}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      product: e.target.value,
                    })
                  }
                >
                  <option value="">Бараа сонгоно уу</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.itemName} (₮{product.itemPrice})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="border p-2 rounded"
                  value={selectedProduct.quantity}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleAddProduct}
                >
                  Нэмэх
                </button>
              </div>
            </div>

            {/* Нэмсэн бараанууд */}
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Барааны нэр</th>
                  <th className="px-4 py-2 border">Тоо ширхэг</th>
                  <th className="px-4 py-2 border">Нийт үнэ</th>
                </tr>
              </thead>
              <tbody>
                {newOrder.product_details.map((product, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{product.productName}</td>
                    <td className="border px-4 py-2">{product.quantity}</td>
                    <td className="border px-4 py-2">
                      ₮{product.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Нэмэлт тайлбар */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="description"
              >
                Нэмэлт тайлбар:
              </label>
              <textarea
                id="description"
                className="border p-2 rounded w-full"
                value={newOrder.description}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* Нийт үнэ */}
            <div className="mb-4">
              <h3 className="text-lg font-bold">
                Нийт үнэ: ₮{newOrder.totalPrice.toFixed(2)}
              </h3>
            </div>

            {/* Товчлуурууд */}
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Болих
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleAddOrder}
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Харах Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Захиалга Харах</h2>
            <p className="mb-2">
              <strong>ID:</strong> {selectedOrder.id}
            </p>
            <p className="mb-2">
              <strong>Хэрэглэгч:</strong> {selectedOrder.user}
            </p>
            <p className="mb-2">
              <strong>Салбар:</strong> {selectedOrder.infoCUBranch}
            </p>
            <p className="mb-2">
              <strong>Нийт үнэ:</strong> ₮
              {typeof selectedOrder.totalPrice === "number"
                ? selectedOrder.totalPrice.toFixed(2)
                : parseFloat(selectedOrder.totalPrice || 0).toFixed(2)}
            </p>
            <p className="mb-4">
              <strong>Төлөв:</strong> {selectedOrder.status}
            </p>

            {/* Барааны мэдээлэл */}
            <h3 className="text-lg font-bold mb-2">Барааны мэдээлэл</h3>
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Барааны зураг</th>
                  <th className="border px-4 py-2">Барааны нэр</th>
                  <th className="border px-4 py-2">Тоо ширхэг</th>
                  <th className="border px-4 py-2">Дэд нийт үнэ</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.product_details.map((product, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">
                      {product.image ? (
                        <img
                          src={`${API_URL}${product.image}`}
                          alt={product.productName}
                          className="h-16 w-16 object-cover"
                        />
                      ) : (
                        "Зураг алга"
                      )}
                    </td>
                    <td className="border px-4 py-2">{product.productName}</td>
                    <td className="border px-4 py-2">{product.quantity}</td>
                    <td className="border px-4 py-2">
                      ₮{(product.quantity * product.itemPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Захиалгын огноо */}
            <p className="mt-4">
              <strong>Захиалгын огноо:</strong>{" "}
              {new Date(selectedOrder.createdDate).toLocaleDateString("mn-MN")}
            </p>

            {/* Хаах товч */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsViewModalOpen(false)}
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
