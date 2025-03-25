import React, { useEffect, useState } from "react";
import { fetchData } from "../api";
import Card from "../components/Card";
import { postData } from "../api";
import Chart from "../components/Chart";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split("T")[0]; // Format to YYYY-MM-DD
  };

  const [reportData, setReportData] = useState([]);
  const [dateFrom, setDateFrom] = useState(getCurrentDate());
  const [dateTo, setDateTo] = useState(getCurrentDate());
  const [chartData, setChartData] = useState(null);
  const [repairsTotal, setRepairsTotal] = useState(0);
  const [data, setData] = useState({
    totalOrders: 0,
    activeUsers: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const orders = await fetchData("histories");
      const users = await fetchData("users");
      setData({
        totalOrders: orders.length,
        activeUsers: users.filter((user) => user.isActive).length,
        todayRevenue: orders.reduce(
          (sum, order) => sum + parseFloat(order.totalPrice),
          0
        ),
      });
    };
    fetchDashboardData();
  }, []);

  const fetchReport = async () => {
    const date = {
      date_from: dateFrom,
      date_to: dateTo,
    };

    try {
      const data = await postData("report", date);
      setReportData(data.products);
      setRepairsTotal(data.repairs_total);

      // График мэдээлэл боловсруулах
      const chartLabels = data.products.map((item) => item.product__itemName);
      const chartValues = data.products.map((item) => item.total_sold);

      setChartData({
        labels: chartLabels,
        datasets: [
          {
            label: "Борлуулалт",
            data: chartValues,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Алдаа гарлаа:", error.message);
      alert("Тайлан татаж чадсангүй. Дахин оролдоно уу.");
    }
  };
  const user = JSON.parse(sessionStorage.getItem("user"));
  const navigate = useNavigate();
  const onLogout = () => {
    // Жишээ logout үйлдэл
    sessionStorage.removeItem("user"); // Хэрэв токен хадгалсан бол устгана
    // navigate("/login");
    window.location.reload();
  };
  return (
    <div className="h-screen p-6 bg-gray-50 overflow-auto">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <h1 className="text-xl font-bold">Тавтай морил, {user.username}!</h1>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Гарах
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Удирдах самбар</h1>

      {/* Картууд */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          title="Нийт дуудлага"
          value={data.totalOrders}
          bgColor="bg-blue-100"
          textColor="text-blue-800"
        />
        <Card
          title="Идэвхтэй хэрэглэгчид"
          value={data.activeUsers}
          bgColor="bg-green-100"
          textColor="text-green-800"
        />
        <Card
          title="Нийт Дүн"
          value={`₮${data.todayRevenue.toFixed(2)}`}
          bgColor="bg-yellow-100"
          textColor="text-yellow-800"
        />
      </div>

      {/* Тайлан хэсэг */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Тайлан</h1>

        {/* Огнооны сонголт */}
        <div className="mb-6 flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Эхлэх огноо:
            </label>
            <input
              type="date"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дуусах огноо:
            </label>
            <input
              type="date"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6"
            onClick={fetchReport}
          >
            Тайлан харах
          </button>
        </div>

        {/* График */}
        {chartData && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Барааны борлуулалтын график
            </h2>
            <Chart data={chartData} title="Барааны борлуулалтын статистик" />
          </div>
        )}

        {/* Засварын нийт үнийн дүн */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            Засварын нийт үнийн дүн
          </h2>
          <p className="text-gray-700 text-lg">
            ₮{repairsTotal.toLocaleString()}
          </p>
        </div>

        {/* Барааны борлуулалтын хүснэгт */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">
                  Барааны нэр
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">
                  Борлуулсан тоо хэмжээ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.map((report, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {report.product__itemName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {report.total_sold}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
