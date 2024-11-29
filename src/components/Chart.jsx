import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js бүртгэл
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ data, options, title }) => {
  const defaultOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: !!title,
        text: title || "График",
      },
    },
    ...options,
  };

  return <Bar data={data} options={defaultOptions} />;
};

export default Chart;
