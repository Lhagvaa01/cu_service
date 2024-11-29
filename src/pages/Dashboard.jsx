import React, { useEffect, useState } from "react";
import { fetchData } from "../api";
import Card from "../components/Card";
import { postData } from "../api";
// import { Bar } from "react-chartjs-2";
import Chart from "../components/Chart";

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

  return (
    <div className="h-full p-6">
      <h1 className="text-3xl font-bold mb-6">Удирдах самбар</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Нийт захиалга"
          value={data.totalOrders}
          bgColor="bg-blue-100"
        />
        <Card
          title="Идэвхтэй хэрэглэгчид"
          value={data.activeUsers}
          bgColor="bg-green-100"
        />
        <Card
          title="Өнөөдрийн орлого"
          value={`₮${data.todayRevenue.toFixed(2)}`}
          bgColor="bg-yellow-100"
        />
      </div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Тайлан</h1>
        <div className="mb-4 flex items-center">
          <div className="mr-4">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="date_from"
            >
              Эхлэх огноо:
            </label>
            <input
              id="date_from"
              type="date"
              className="border p-2 rounded"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="mr-4">
            <label className="block text-sm font-medium mb-1" htmlFor="date_to">
              Дуусах огноо:
            </label>
            <input
              id="date_to"
              type="date"
              className="border p-2 rounded"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-6"
            onClick={fetchReport}
          >
            Тайлан харах
          </button>
        </div>

        {chartData && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">
              Барааны борлуулалтын график
            </h2>
            <Chart data={chartData} title="Барааны борлуулалтын статистик" />
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Засварын нийт үнийн дүн</h2>
          <p className="text-gray-700">₮{repairsTotal.toLocaleString()}</p>
        </div>

        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Барааны нэр</th>
              <th className="px-4 py-2">Борлуулсан тоо хэмжээ</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((report, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{report.product__itemName}</td>
                <td className="border px-4 py-2">{report.total_sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
