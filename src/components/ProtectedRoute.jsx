import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("user"); // Токен хадгалсан байгааг шалгах
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
