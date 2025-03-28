import React, { useMemo } from "react";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";

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

  return (
    <div className="w-full overflow-x-auto">
      {/* Cards Layout */}
      <div className="space-y-4">
        {page.map((row) => {
          prepareRow(row);
          return (
            <div
              key={row.id}
              {...row.getRowProps()}
              className="border p-4 rounded-lg shadow-lg bg-white"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {row.cells.map((cell) => (
                  <div
                    key={cell.column.id}
                    className="flex flex-col items-start text-sm"
                  >
                    <span className="font-semibold text-gray-700">
                      {cell.column.Header}:
                    </span>
                    <span className="text-gray-600">{cell.render("Cell")}</span>
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
