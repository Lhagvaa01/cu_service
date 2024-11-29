import React from "react";

const Card = ({ title, value, bgColor = "bg-blue-100" }) => {
  return (
    <div className={`p-4 rounded shadow ${bgColor}`}>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
};

export default Card;
