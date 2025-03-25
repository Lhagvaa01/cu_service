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

  if (!Order) return null; // ✅ "useEffect" Hook-ээс дараа байрлуулсан

  // Сонголтуудыг тохируулах
  const options = infoServiceType.map((type) => ({
    label: type.name,
    value: type.pk,
  }));

  // Сонгогдсон зүйлсийг хадгалах
  const handleServiceTypeChange = (selected) => {
    setOrder((prev) => ({
      ...prev,
      service_types: selected.map((item) => item.value),
    }));
  };

  // Салбар сонголтын өөрчлөлт
  const handleBranchChange = (selectedOption) => {
    setOrder((prev) => ({
      ...prev,
      infoCUBranch: selectedOption ? selectedOption.value : 0, // Ensure safe access to selectedOption
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Дуудлага бүртгэл</h2>

        {/* Салбар сонгох */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Салбар сонгох:
          </label>
          <Select
            className="w-full"
            value={Order.infoCUBranch.id}
            onChange={handleBranchChange}
            options={branches.map((branch) => ({
              value: branch.id,
              label: branch.name,
            }))}
            placeholder="Салбар сонгоно уу"
            isClearable
          />
        </div>

        {/* Засварын төрөл сонгох */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Засварын төрөл:
          </label>
          <MultiSelect
            options={options}
            value={options.filter((opt) =>
              Order.service_types
                ? Order.service_types.includes(opt.value)
                : false
            )}
            onChange={handleServiceTypeChange}
            labelledBy="Select"
          />
        </div>

        {/* Нэмэлт тайлбар */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Нэмэлт тайлбар:
          </label>
          <textarea
            className="border p-2 rounded w-full"
            value={Order.description || ""}
            onChange={(e) =>
              setOrder((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        {/* Нийт үнэ */}
        <div className="mb-4">
          <h3 className="text-lg font-bold">
            Нийт үнэ: ₮{Order.totalPrice ? Order.totalPrice.toFixed(2) : "0.00"}
          </h3>
        </div>

        {/* Товчлуурууд */}
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => setIsModalOpen(false)}
          >
            Болих
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => handleAddOrder(Order)}
          >
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
