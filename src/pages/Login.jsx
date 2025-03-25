import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://api.cu.kacc.mn/api/login/",
        // "http://127.0.0.1:8000/api/login/",
        {
          email,
          password,
        }
      );

      if (response.data.message === "Login successful") {
        // Хэрэглэгчийн мэдээллийг хадгалах (жишээ нь localStorage эсвэл context API ашиглан)
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        // Нэвтрэлт амжилттай бол системийн гол хуудас руу шилжих
        window.location.href = "/orders";
        // window.location.href = "/dashboard";
      } else {
        setError("Нэвтрэх нэр эсвэл нууц үг буруу байна.");
      }
    } catch (err) {
      setError("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Нэвтрэх</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Имэйл
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Имэйлээ оруулна уу"
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Нууц үг
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Нууц үгээ оруулна уу"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Нэвтрэх
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
