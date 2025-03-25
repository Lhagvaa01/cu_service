import { useEffect } from "react";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // 3 секундийн дараа хаах
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-transform transform translate-x-0 animate-slide-in">
      {message}
      <button className="ml-4 text-white font-bold" onClick={onClose}>
        ✖
      </button>
    </div>
  );
};

export default Toast;
