import React, { useState } from "react";
import { postData } from "../api";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchReport = async () => {
    // Огнооны мэдээллийг оруулах
    const date = {
      date_from: dateFrom,
      date_to: dateTo,
    };

    try {
      // `postData` функц ашиглан мэдээллийг илгээх
      const data = await postData("report", date);
      setReportData(data); // Серверээс ирсэн өгөгдлийг state-д хадгалах
    } catch (error) {
      console.error("Алдаа гарлаа:", error.message);
      alert("Тайлан татаж чадсангүй. Дахин оролдоно уу...");
    }
  };

  return (
    <div className="h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Тайлан</h1>
      <div className="mb-4 flex items-center">
        <div className="mr-4">
          <label className="block text-sm font-medium mb-1" htmlFor="date_from">
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
      {reportData.length > 0 ? (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Захиалгын ID</th>
              <th className="px-4 py-2">Хэрэглэгч</th>
              <th className="px-4 py-2">Нийт үнэ</th>
              <th className="px-4 py-2">Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((report) => (
              <tr key={report.id}>
                <td className="border px-4 py-2">{report.id}</td>
                <td className="border px-4 py-2">{report.user?.TCUSERNAME}</td>
                <td className="border px-4 py-2">{report.totalPrice}</td>
                <td className="border px-4 py-2">{report.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">Тайлангийн өгөгдөл олдсонгүй.</p>
      )}
    </div>
  );
};

export default Reports;
