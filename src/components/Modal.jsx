import React, { useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";
import Select from "react-select";

const Modal = ({
  setIsModalOpen,
  Order,
  setOrder,
  branches,
  infoServiceType,
  handleAddOrder,
}) => {
  useEffect(() => {
    console.log("Current Order description:", Order);
  }, [Order]);

  if (!Order) return null;

  const options = infoServiceType.map((type) => ({
    label: type.name,
    value: type.pk,
  }));

  const handleServiceTypeChange = (selected) => {
    setOrder((prev) => ({
      ...prev,
      service_types: selected.map((item) => item.value),
    }));
  };

  const handleBranchChange = (selectedOption) => {
    setOrder((prev) => ({
      ...prev,
      infoCUBranch: selectedOption
        ? { id: selectedOption.value, name: selectedOption.label }
        : null,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Дуудлага бүртгэл
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Branch Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Салбар сонгох:
            </label>
            <Select
              className="w-full text-sm"
              value={
                Order.infoCUBranch
                  ? {
                      value: Order.infoCUBranch.id,
                      label: Order.infoCUBranch.name,
                    }
                  : null
              }
              onChange={handleBranchChange}
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
              placeholder="Салбар сонгоно уу"
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "42px",
                  borderColor: "#d1d5db",
                  "&:hover": {
                    borderColor: "#9ca3af",
                  },
                }),
              }}
            />
          </div>

          {/* Service Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Засварын төрөл:
            </label>
            <div className="border border-gray-300 rounded-md">
              <MultiSelect
                options={options}
                value={options.filter(
                  (opt) => Order.service_types?.includes(opt.value) || false
                )}
                onChange={handleServiceTypeChange}
                labelledBy="Select"
                className="text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Нэмэлт тайлбар:
            </label>
            <textarea
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={Order.description || ""}
              onChange={(e) =>
                setOrder((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Тайлбар оруулах..."
            />
          </div>

          {/* Total Price */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="text-lg font-bold text-gray-800">
              Нийт үнэ: ₮
              {Order.totalPrice ? Order.totalPrice.toFixed(2) : "0.00"}
            </h3>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
            onClick={() => setIsModalOpen(false)}
          >
            Болих
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
            onClick={() => handleAddOrder(Order)}
            disabled={!Order.infoCUBranch}
          >
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
