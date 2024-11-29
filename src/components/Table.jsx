import React from "react";

const Table = ({ headers, rows }) => {
  return (
    <table className="min-w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="border px-4 py-2 bg-gray-100">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border px-4 py-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
