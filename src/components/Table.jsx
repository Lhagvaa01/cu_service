import React, { useEffect, useMemo } from "react";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";
import {
  FaClock,
  FaPhone,
  FaCheckCircle,
  FaTools,
  FaTimesCircle,
  FaUndo,
  FaMapMarkerAlt,
} from "react-icons/fa";

const ResponsiveCardLayout = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const handleViewMap = (latitude, longitude) => {
    if (latitude && longitude) {
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(mapUrl, "_blank");
    } else {
      alert("Газрын зургийн мэдээлэл байхгүй байна.");
    }
  };

  const statusStyles = {
    1: { color: "#f59e0b", bg: "#fef3c7", icon: <FaClock /> },
    2: { color: "#ef4444", bg: "#fee2e2", icon: <FaPhone /> },
    3: { color: "#10b981", bg: "#d1fae5", icon: <FaCheckCircle /> },
    4: { color: "#3b82f6", bg: "#bfdbfe", icon: <FaTools /> },
    5: { color: "#6b7280", bg: "#e5e7eb", icon: <FaTimesCircle /> },
    6: { color: "#9333ea", bg: "#ede9fe", icon: <FaUndo /> },
  };

  useEffect(() => {
    console.log(columns);
    console.log(data[0]);
  }, [data]);

  return (
    <div className="w-full overflow-x-auto">
      {/* Cards Layout */}
      <div className="space-y-4 ">
        {page.map((row) => {
          prepareRow(row);
          return (
            <div
              key={row.id}
              {...row.getRowProps()}
              className={`p-4 border-l-8  rounded-lg shadow-lg bg-white `}
              style={{
                borderLeftColor: statusStyles[row.original.status]?.bg,
                // backgroundColor: statusStyles[row.original.status]?.bg,
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {row.cells.map((cell) => (
                  <div
                    key={cell.column.id}
                    className="flex flex-col lg:flex-row gap-3 items-start text-sm"
                  >
                    {cell.column.Header == "Падааны №" ? (
                      <span className="font-extrabold text-green-600">
                        {cell.column.Header}:
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-700">
                        {cell.column.Header}:
                      </span>
                    )}

                    {cell.column.Header != "Салбар" ? (
                      cell.column.Header == "Падааны №" ? (
                        <span className="text-green-600 font-extrabold">
                          {cell.render("Cell")}
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          {cell.render("Cell")}
                        </span>
                      )
                    ) : (
                      <span className="flex text-gray-600">
                        {cell.render("Cell")}
                        <button
                          className="ml-3 bg-blue-500  text-white px-2 py-1 rounded  flex items-center justify-center"
                          onClick={() =>
                            handleViewMap(
                              row.original.infoCUBranch.latitude,
                              row.original.infoCUBranch.longitude
                            )
                          }
                        >
                          <FaMapMarkerAlt className="text-white text-sm" />
                        </button>
                      </span>
                    )}
                    {/* <span className="text-gray-600">{cell.render("Cell")}</span> */}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-4 py-2 border rounded"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ResponsiveCardLayout;
