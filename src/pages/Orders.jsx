import React, { useEffect, useState } from "react";
import { fetchData, postData, updateData, updateStatus } from "../api";
import Table from "../components/Table";
import ResponsiveCardLayout from "../components/ResponsiveTable";
import Modal from "../components/Modal";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import {
  FaClock,
  FaPhone,
  FaCheckCircle,
  FaTools,
  FaTimesCircle,
  FaUndo,
} from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import { useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import ImageModal from "../components/ImageModal";

const Orders = () => {
  // const API_URL = "http://127.0.0.1:8000/";
  const API_URL = "https://api.cu.kacc.mn/";

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // const openModal = () => {
  //   setModalData(exampleData);
  //   setShowModal(true);
  // };

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });

  const user = JSON.parse(sessionStorage.getItem("user"));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    user: 1,
    infoCUBranch: 0,
    totalPrice: 0,
    description: "",
    isPay: false,
    status: 1,
    product_details: [],
    service_types: [],
  });

  const statusStyles = {
    1: { color: "#f59e0b", bg: "#fef3c7", icon: <FaClock /> },
    2: { color: "#ef4444", bg: "#fee2e2", icon: <FaPhone /> },
    3: { color: "#10b981", bg: "#d1fae5", icon: <FaCheckCircle /> },
    4: { color: "#3b82f6", bg: "#bfdbfe", icon: <FaTools /> },
    5: { color: "#6b7280", bg: "#e5e7eb", icon: <FaTimesCircle /> },
    6: { color: "#9333ea", bg: "#ede9fe", icon: <FaUndo /> },
  };

  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [infoStatus, setInfoStatus] = useState([]);
  const [infoServiceType, setInfoServiceType] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const ordersData = await fetchData("histories");
        const branchesData = await fetchData("branches");
        const productsData = await fetchData("products");
        const infoStatusData = await fetchData("infoStatus");
        const infoServiceTypeData = await fetchData("infoServiceType");

        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setBranches(branchesData);
        setProducts(productsData);
        setInfoStatus(infoStatusData);
        setInfoServiceType(infoServiceTypeData);
      } catch (error) {
        console.error("Алдаа гарлаа:", error.message);
      }
    };
    fetchInitialData();
  }, []);

  const handleStatusChange = async (orderId, newStatusId) => {
    const allowedStatuses = infoStatus.map((status) => status.pk);
    if (!allowedStatuses.includes(newStatusId)) {
      alert("Таны эрхэнд энэ төлөвийг солих боломжгүй.");
      return;
    }

    try {
      const updatedOrder = orders.find((order) => order.id === orderId);
      updatedOrder.status = newStatusId;
      const jsonOrderStatus = JSON.stringify({ status: newStatusId });
      await updateStatus(
        `/histories/${orderId}/update-status/`,
        jsonOrderStatus
      );

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      setFilteredOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      setToast({ show: true, message: "Төлөв амжилттай шинэчлэгдлээ!" });
    } catch (error) {
      console.error("Төлөв шинэчлэхэд алдаа гарлаа:", error.message);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    if (value) {
      setFilteredOrders(
        orders.filter((order) => String(order.status) === value)
      );
    } else {
      setFilteredOrders(orders);
    }
    calculateTotalPrice();
  };

  // const [dateFilter, setDateFilter] = useState(
  //   new Date().toISOString().split("T")[0]
  // );
  // const [endDateFilter, setEndDateFilter] = useState(
  //   new Date().toISOString().split("T")[0]
  // );

  const getFirstDayOfMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    // console.log("📅 Сарын эхний өдөр:", firstDay); // Шалгах
    return firstDay;
  };

  const getLastDayOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    // console.log("📅 Сарын сүүлийн өдөр:", lastDay); // Шалгах
    return lastDay;
  };

  const [dateFilter, setDateFilter] = useState(getFirstDayOfMonth()); // Сарын эхний өдөр
  const [endDateFilter, setEndDateFilter] = useState(getLastDayOfMonth()); // Сарын сүүлийн өдөр

  const handleDateFilterChange = (e, type) => {
    const value = e.target.value;

    if (type === "start") {
      setDateFilter(value);
    } else {
      setEndDateFilter(value);
    }
  };

  useEffect(() => {
    setFilteredOrders(
      orders.filter((order) => {
        const orderDate = new Date(order.createdDate)
          .toISOString()
          .split("T")[0];
        return orderDate >= dateFilter && orderDate <= endDateFilter;
      })
    );
    calculateTotalPrice();
  }, [dateFilter, endDateFilter, orders]);

  const handleServiceTypeFilterChange = (e) => {
    const value = e.target.value;
    setServiceTypeFilter(value);

    if (value) {
      setFilteredOrders(
        orders.filter((order) => order.service_types.includes(parseInt(value)))
      );
    } else {
      setFilteredOrders(orders);
    }
  };

  const calculateTotalPrice = () => {
    if (!filteredOrders || filteredOrders.length === 0) return 0;

    const total = filteredOrders.reduce((sum, order) => {
      const productTotal =
        order.product_details?.reduce((subtotalSum, product) => {
          const subtotal = product.quantity * product.itemPrice || 0;
          return subtotalSum + subtotal;
        }, 0) || 0;

      return sum + productTotal;
    }, 0);

    return total.toFixed(2);
  };

  const calculatePrice = (order) => {
    if (
      !order ||
      !order.product_details ||
      order.product_details.length === 0
    ) {
      return "0.00";
    }

    const total = order.product_details.reduce((sum, product) => {
      const subtotal = product.quantity * product.itemPrice || 0;
      return sum + subtotal;
    }, 0);

    return total.toFixed(2);
  };

  const exportToExcel = () => {
    const flattenedOrders = filteredOrders.map((order) => {
      const productDetails = order.product_details.map((product) => ({
        productName: product.productName,
        itemPrice: product.itemPrice,
        quantity: product.quantity,
      }));

      return {
        id: order.id,
        createdDate: new Date(order.createdDate).toLocaleString(),
        branchName: order.infoCUBranch.name,
        totalPrice: order.totalPrice,
        status: ShowOrderStatusName(order.status),
        creted_user: order.creted_user?.TCUSERNAME,
        fixed_user: order.fixed_user?.TCUSERNAME,
        ...productDetails[0],
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(flattenedOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Захиалгууд");
    XLSX.writeFile(workbook, "Захиалгууд.xlsx");
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const exportImagesToPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    let yPosition = 10;

    const images = filteredOrders
      .flatMap((order) => order.images)
      .map((img) => ({
        url: `https://api.cu.kacc.mn${img.image}`,
        uploadedAt: img.uploaded_at,
      }));

    if (images.length === 0) {
      alert("Ямар ч зураг олдсонгүй!");
      return;
    } else {
      console.log("Зураг боловсруулах:", images);
    }

    // PDF дотор зургийн мэдээллийг оруулах
    for (const image of images) {
      const { url, uploadedAt } = image;
      console.log("Зураг боловсруулж байна:", url);

      // Огноог PDF дотор оруулах
      const uploadedDate = new Date(uploadedAt);
      const formattedDate = formatDate(uploadedDate);
      pdf.setFont("Arial"); // 'helvetica' стандарт фонт
      pdf.setFontSize(12); // Фонтын хэмжээг тохируулах
      // Огноог PDF дээр байрлуулах
      pdf.text(`${formattedDate}`, 15, yPosition);
      yPosition += 10;

      const imgWidth = 180;
      const imgHeight = 180;

      // Зургийн байрлал болон хуудас шилжүүлэх
      if (yPosition + imgHeight + 10 > 297) {
        // A4 хуудасны өндөр нь 297mm
        pdf.addPage(); // Шинэ хуудас үүсгэх
        yPosition = 10; // Шинэ хуудсанд эхлэх байрлал
      }

      // Зургийг нэмэх
      pdf.addImage(url, "PNG", 15, yPosition, imgWidth, imgHeight);

      yPosition += imgHeight + 10;
    }

    // Сонгогдсон огноог ашиглан файл нэрийг үүсгэх
    const fileName = `Kaccmn_Засвар_${formatDate(dateFilter)}-${formatDate(
      endDateFilter
    )}.pdf`;

    // PDF-ийг хадгалах
    pdf.save(fileName);
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetchData(`histories/dtl/${orderId}`);
      setSelectedOrder(response);
      return response;
    } catch (error) {
      console.error("Захиалгын мэдээлэл татахад алдаа гарлаа:", error.message);
    }
  };

  const newOrderCreate = () => {
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleRowView = (order) => {
    fetchOrderDetails(order.id);
    setIsViewModalOpen(true);
  };

  const handleRowEdit = async (order) => {
    setIsEdit(true);
    const fetchedOrder = await fetchOrderDetails(order.id);
    setIsModalOpen(true);
  };

  const handleAddOrder = async (order) => {
    if (!order.infoCUBranch) {
      alert("Салбарыг сонгоно уу!");
      return;
    }

    try {
      const formattedOrder = {
        ...order,
        creted_user: user.id || user.user,
        fixed_user: null,
        infoCUBranch: order.infoCUBranch.id || order.infoCUBranch,
      };
      let response = [];
      if (isEdit) {
        response = await updateData(
          `/histories/update`,
          formattedOrder.id,
          formattedOrder
        );
      } else {
        response = await postData("histories", formattedOrder).then((value) => {
          if (value.id > 0) {
            window.location.reload();
          }
        });
      }

      setIsModalOpen(false);
      setToast({ show: true, message: "Шинэ захиалга амжилттай нэмэгдлээ!" });
    } catch (error) {
      console.error("Алдаа гарлаа:", error.message);
      alert("Захиалга нэмэхэд алдаа гарлаа.");
    }
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((order) => order.status === 1).length,
    resolved: orders.filter((order) => order.status === 3).length,
    on_call: orders.filter((order) => order.status === 2).length,
    on_service: orders.filter((order) => order.status === 4).length,
    no_service: orders.filter((order) => order.status === 5).length,
    return: orders.filter((order) => order.status === 6).length,
  };

  const ShowOrderStatusName = (id) => {
    const statuses = [
      { pk: 1, code: "pending", name: "Хүлээгдэж байгаа", role: "A" },
      { pk: 2, code: "on_call", name: "Дуудлага хүлээн авсан", role: "K" },
      { pk: 3, code: "resolved", name: "Шийдэгдсэн", role: "K" },
      {
        pk: 4,
        code: "on_service",
        name: "Засварын төв дээр авчирсан",
        role: "K",
      },
      { pk: 5, code: "no_service", name: "Засах боломжгүй", role: "K" },
      { pk: 6, code: "return", name: "Цуцалсан", role: "A" },
    ];

    const status = statuses.find((s) => s.pk === id);
    return status ? status.name : "Тодорхойгүй төлөв";
  };

  const OrderDate = (createdDate) => {
    const date = new Date(createdDate);
    const formattedDate = date.toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return formattedDate;
  };

  const navigate = useNavigate();
  const onLogout = () => {
    sessionStorage.removeItem("user");
    window.location.reload();
  };

  const getStatusName = (statusId) => {
    const status = infoStatus.find((s) => s.pk === statusId);
    return status ? status.name : "Тодорхойгүй";
  };

  const options = infoServiceType.map((type) => ({
    label: type.name,
    value: type.pk,
  }));

  const isKSelectedNonAStatus = (order) => {
    const selectedStatus = infoStatus.find((s) => s.pk === order.status);
    return selectedStatus && selectedStatus.role !== "A";
  };

  const handleUploadImage = async (rowData) => {
    const formData = new FormData();

    // Оруулах зургуудаа сонгоно
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.accept = "image/*";

    fileInput.onchange = async (event) => {
      const files = event.target.files;

      // Файлуудыг `FormData` руу нэмэх
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      // PUT хүсэлт илгээх
      try {
        const response = await fetch(
          `https://api.cu.kacc.mn/api/histories/update/${rowData.id}/`,
          // `http://localhost:8000/api/histories/update/${rowData.id}/`,
          {
            method: "PUT",
            body: formData,
          }
        );

        const data = await response.json();
        if (response.ok) {
          alert("Зураг амжилттай нэмэгдлээ!");
        } else {
          console.error("Алдаа гарлаа:", data);
        }
      } catch (error) {
        console.error("Сүлжээний алдаа:", error);
      }
    };

    fileInput.click();
  };

  const handleViewImages = async (rowData) => {
    try {
      const response = await fetch(
        // `http://localhost:8000/api/histories/${rowData.id}/`
        `https://api.cu.kacc.mn/api/histories/${rowData.id}/`
      );
      const data = await response.json();

      if (response.ok) {
        // 🖼 Зургийн жагсаалтыг харуулах (Жишээ нь, modal)
        // showImageModal(data);
        showImageModal(data.images);
      } else {
        console.error("Алдаа:", data);
      }
    } catch (error) {
      console.error("Сүлжээний алдаа:", error);
    }
  };

  // Modal-д зураг харуулах функц
  const showImageModal1 = (data) => {
    if (new Date(data.createdDate) > new Date("2025-04-30")) {
      const {
        images,
        product_details,
        totalPrice,
        createdDate,
        infoCUBranch,
        creted_user,
        receivedName,
        receivedPhone,
        fixedDate,
        fixed_user,
      } = data;

      const modal = document.createElement("div");
      modal.classList.add(
        "fixed",
        "top-0",
        "left-0",
        "w-full",
        "h-full",
        "bg-white",
        "bg-opacity-95",
        "z-50",
        "overflow-auto",
        "p-10",
        "flex",
        "justify-center"
      );

      const modalContent = document.createElement("div");
      modalContent.classList.add(
        "bg-white",
        "shadow-lg",
        "rounded-lg",
        "p-8",
        "w-full",
        "max-w-4xl"
      );

      // 🧾 Header Section (Branch, Date, User)
      modalContent.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Бараа хүлээлгэн өгсөн падаан</h2>
        <p><strong>Салбар:</strong> ${infoCUBranch.name}</p>
        <p><strong>Үүсгэсэн хэрэглэгч:</strong> ${creted_user.TCUSERNAME}</p>
        <p><strong>Огноо:</strong> ${new Date(createdDate).toLocaleString()}</p>
        <p><strong>Засварласан огноо:</strong> ${new Date(
          fixedDate
        ).toLocaleString()}</p>
        <hr class="my-4" />
      `;

      // 📦 Product Table
      const table = document.createElement("table");
      table.classList.add("w-full", "border", "mb-4");
      table.innerHTML = `
        <thead>
          <tr class="bg-gray-200">
            <th class="border px-4 py-2 text-left">Бараа</th>
            <th class="border px-4 py-2 text-right">Тоо</th>
            <th class="border px-4 py-2 text-right">Үнэ</th>
          </tr>
        </thead>
        <tbody>
          ${product_details
            .map(
              (p) => `
            <tr>
              <td class="border px-4 py-2">${p.productName}</td>
              <td class="border px-4 py-2 text-right">${p.quantity}</td>
              <td class="border px-4 py-2 text-right">${p.itemPrice.toLocaleString()}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      `;
      modalContent.appendChild(table);

      // 💵 Total price
      const total = document.createElement("p");
      total.classList.add("text-right", "font-bold", "text-lg");
      total.textContent = `Нийт үнэ: ${parseFloat(
        totalPrice
      ).toLocaleString()}₮`;
      modalContent.appendChild(total);

      const fixedContainer = document.createElement("div");
      fixedContainer.classList.add("relative", "mb-4");

      // 🖼 Зураг
      const fixedImage = document.createElement("img");
      fixedImage.src = "/kaccService.png";
      fixedImage.alt = "Засварласан хэрэглэгч";
      fixedImage.classList.add("absolute", "-top-6", "right-50", "w-3xs");

      // 📝 Текст
      const fixedText = document.createElement("p");
      fixedText.classList.add("text-left", "font-bold", "text-lg", "pl-10"); // left padding for image
      fixedText.textContent = `Засварласан хэрэглэгч: ${fixed_user.TCUSERNAME.toLocaleString()}`;

      // Элементүүдийг холбоно
      fixedContainer.appendChild(fixedImage);
      fixedContainer.appendChild(fixedText);
      modalContent.appendChild(fixedContainer);

      const receiveName = document.createElement("p");
      receiveName.classList.add("text-left", "font-bold", "text-lg");
      receiveName.textContent = `Хүлээн авсан хэрэглэгч нэр/утас: ${
        receivedName.toLocaleString() + ", " + receivedPhone.toLocaleString()
      }`;
      modalContent.appendChild(receiveName);

      // 🖼 Images Section
      if (images.length > 0) {
        const imageGrid = document.createElement("div");
        imageGrid.classList.add(
          "grid",
          "grid-cols-2",
          "md:grid-cols-3",
          "gap-4",
          "mt-6"
        );

        images.forEach((image) => {
          const container = document.createElement("div");
          container.classList.add(
            "relative",
            "group",
            "border",
            "rounded",
            "overflow-hidden"
          );

          const img = document.createElement("img");
          img.src = `https://api.cu.kacc.mn${image.image}`;
          img.classList.add(
            "w-full",
            "h-auto",
            "object-contain",
            "cursor-pointer"
          );
          img.onclick = () => openImageInFullscreen(img.src);

          const downloadBtn = document.createElement("a");
          downloadBtn.href = img.src;
          downloadBtn.download = `image-${image.id}`;
          downloadBtn.textContent = "Татах";
          downloadBtn.classList.add(
            "absolute",
            "bottom-2",
            "left-2",
            "bg-white",
            "text-black",
            "text-xs",
            "px-2",
            "py-1",
            "rounded",
            "opacity-0",
            "group-hover:opacity-100"
          );

          container.appendChild(img);
          container.appendChild(downloadBtn);
          imageGrid.appendChild(container);
        });

        modalContent.appendChild(imageGrid);
      }

      const saveAsImage = () => {
        html2canvas(modalContent).then((canvas) => {
          const link = document.createElement("a");
          link.download = "padaan.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        });
      };

      const downloadButton = document.createElement("button");
      downloadButton.textContent = "Зураг хэлбэрээр хадгалах";
      downloadButton.classList.add(
        "mt-6",
        "bg-blue-600",
        "text-white",
        "px-4",
        "py-2",
        "rounded",
        "hover:bg-blue-700"
      );
      downloadButton.onclick = saveAsImage;
      modalContent.appendChild(downloadButton);

      // ❌ Close on click outside
      modal.onclick = () => document.body.removeChild(modal);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
    } else {
      const imageModal = document.createElement("div");
      imageModal.classList.add(
        "fixed",
        "top-0",
        "left-0",
        "w-full",
        "h-full",
        // "bg-black",
        // "bg-opacity-75",
        "border-2",
        "flex",
        "justify-center",
        "items-center",
        "overflow-auto",
        "p-5"
      );

      data.images.forEach((image) => {
        const imgContainer = document.createElement("div");
        imgContainer.classList.add(
          "relative",
          "group",
          "max-w-xs",
          "w-full",
          "mx-4",
          "rounded-lg",
          "overflow-hidden"
        );

        const img = document.createElement("img");
        img.src = "https://api.cu.kacc.mn" + image.image;
        // img.src = "http://127.0.0.1:8000" + image.image;
        img.classList.add(
          "w-full",
          "h-auto",
          "object-cover",
          "transition-transform",
          "duration-300",
          "transform",
          "group-hover:scale-110"
        );

        // Татаж авах товчийг нэмэх
        const downloadBtn = document.createElement("a");
        downloadBtn.href = img.src;
        downloadBtn.download = `image-${image.id}`;
        downloadBtn.classList.add(
          "absolute",
          "bottom-2",
          "left-2",
          "bg-white",
          "text-black",
          "text-sm",
          "px-3",
          "py-1",
          "rounded-full",
          "opacity-0",
          "group-hover:opacity-100",
          "transition-opacity",
          "duration-300"
        );
        downloadBtn.textContent = "Татаж авах";

        // Зураг дээр дарж томруулах
        img.onclick = () => openImageInFullscreen(img.src);

        imgContainer.appendChild(img);
        imgContainer.appendChild(downloadBtn);
        imageModal.appendChild(imgContainer);
      });

      // Модал дээр дарж хаах
      imageModal.onclick = () => document.body.removeChild(imageModal);

      document.body.appendChild(imageModal);
    }
  };

  // const saveAsImage = () => {
  //   html2canvas(modalContent).then((canvas) => {
  //     const link = document.createElement("a");
  //     link.download = "padaan.png";
  //     link.href = canvas.toDataURL("image/png");
  //     link.click();
  //   });
  // };

  const showImageModal = (images) => {
    const imageModal = document.createElement("div");
    imageModal.classList.add(
      "fixed",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
      // "bg-black",
      // "bg-opacity-75",
      "border-2",
      "flex",
      "justify-center",
      "items-center",
      "overflow-auto",
      "p-5"
    );

    images.forEach((image) => {
      const imgContainer = document.createElement("div");
      imgContainer.classList.add(
        "relative",
        "group",
        "max-w-xs",
        "w-full",
        "mx-4",
        "rounded-lg",
        "overflow-hidden"
      );

      const img = document.createElement("img");
      img.src = "https://api.cu.kacc.mn" + image.image;
      // img.src = "http://127.0.0.1:8000" + image.image;
      img.classList.add(
        "w-full",
        "h-auto",
        "object-cover",
        "transition-transform",
        "duration-300",
        "transform",
        "group-hover:scale-110"
      );

      // Татаж авах товчийг нэмэх
      const downloadBtn = document.createElement("a");
      downloadBtn.href = img.src;
      downloadBtn.download = `image-${image.id}`;
      downloadBtn.classList.add(
        "absolute",
        "bottom-2",
        "left-2",
        "bg-white",
        "text-black",
        "text-sm",
        "px-3",
        "py-1",
        "rounded-full",
        "opacity-0",
        "group-hover:opacity-100",
        "transition-opacity",
        "duration-300"
      );
      downloadBtn.textContent = "Татаж авах";

      // Зураг дээр дарж томруулах
      img.onclick = () => openImageInFullscreen(img.src);

      imgContainer.appendChild(img);
      imgContainer.appendChild(downloadBtn);
      imageModal.appendChild(imgContainer);
    });

    // Модал дээр дарж хаах
    imageModal.onclick = () => document.body.removeChild(imageModal);

    document.body.appendChild(imageModal);
  };

  // Зураг томруулах функц
  const openImageInFullscreen = (src) => {
    const fullscreenImage = document.createElement("div");
    fullscreenImage.classList.add(
      "fixed",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
      "bg-black",
      "bg-opacity-90",
      "flex",
      "justify-center",
      "items-center"
    );

    const img = document.createElement("img");
    img.src = src;
    img.classList.add("max-w-full", "max-h-full", "object-contain");

    // Зураг томруулах хэсэг дээр дарж хаах
    fullscreenImage.onclick = () => document.body.removeChild(fullscreenImage);

    fullscreenImage.appendChild(img);
    document.body.appendChild(fullscreenImage);
  };

  const columns = useMemo(
    () => [
      { Header: "Падааны №", accessor: "id" },
      { Header: "Үүсгэсэн огноо", accessor: "createdDate" },
      { Header: "Бүртгэл үүсгэсэн", accessor: "creted_user.TCUSERNAME" },
      { Header: "Засварласан хэрэглэгч", accessor: "fixed_user.TCUSERNAME" },
      { Header: "Салбар", accessor: "infoCUBranch.name" },
      {
        Header: "Засварын төрөл",
        accessor: "service_types",
        Cell: ({ value }) => (
          <div>
            {infoServiceType
              .filter((service) => value.includes(service.pk))
              .map((service) => (
                <span key={service.pk}>
                  {service.name}
                  <br />
                </span>
              ))}
          </div>
        ),
      },
      {
        Header: "Нийт үнэ",
        accessor: "totalPrice",
        Cell: ({ row }) => calculatePrice(row.original) + "₮",
      },
      {
        Header: "Төлөв",
        accessor: "status",
        Cell: ({ row }) => (
          <div className="relative">
            <Listbox
              value={row.original.status}
              onChange={(newStatus) => {
                if (
                  user.permission === "K" ||
                  (user.permission === "C" &&
                    !isKSelectedNonAStatus(row.original) &&
                    infoStatus.find((s) => s.pk === newStatus)?.role === "A")
                ) {
                  handleStatusChange(row.original.id, newStatus);
                }
              }}
            >
              <Listbox.Button
                className="border p-2 rounded w-full flex items-center gap-2"
                style={{
                  backgroundColor: statusStyles[row.original.status]?.bg,
                }}
              >
                {statusStyles[row.original.status]?.icon}
                {getStatusName(row.original.status)}
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 rounded shadow-md z-10">
                {infoStatus.map((status) => {
                  const isDisabled = !(
                    user.permission === "K" ||
                    (user.permission === "C" &&
                      !isKSelectedNonAStatus(row.original) &&
                      status.role === "A")
                  );

                  return (
                    <Listbox.Option
                      key={status.pk}
                      value={status.pk}
                      disabled={isDisabled}
                      className={`cursor-pointer flex items-center gap-2 p-2 ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      }`}
                      style={{ backgroundColor: statusStyles[status.pk]?.bg }}
                    >
                      {statusStyles[status.pk]?.icon} {status.name}
                    </Listbox.Option>
                  );
                })}
              </Listbox.Options>
            </Listbox>
          </div>
        ),
      },
      {
        Header: "Үйлдэл",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => handleRowView(row.original)}
            >
              Харах
            </button>
            <button
              className={`bg-green-500 text-white px-3 py-1 rounded ${
                user.permission === "C" && isKSelectedNonAStatus(row.original)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105"
              }`}
              onClick={() => {
                if (
                  !(
                    user.permission === "C" &&
                    isKSelectedNonAStatus(row.original)
                  )
                ) {
                  handleRowEdit(row.original);
                }
              }}
              disabled={
                user.permission === "C" && isKSelectedNonAStatus(row.original)
              }
            >
              Засах
            </button>

            {user.permission === "K" ? (
              <>
                <button
                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => handleUploadImage(row.original)}
                >
                  Падаан зураг оруулах
                </button>
                {/* {row.original.images && row.original.images.length > 0 ? (
                  // <button
                  //   className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
                  //   onClick={() => handleViewImages(row.original)}
                  // >
                  //   Падаан харах
                  // </button>
                  <button onClick={openModal}>Падаан харах</button>
                  {showModal && (
                    <ImageModal 
                      data={modalData} 
                      onClose={() => setShowModal(false)} 
                    />
                  )}
                ) : (
                  <div></div> // Хоосон байвал юу ч харагдахгүй
                )} */}
                {row.original.images?.length > 0 && (
                  <>
                    {new Date(row.original.createdDate) >
                    new Date("2025-04-30") ? (
                      <button
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => {
                          setModalData(row.original);
                          setShowModal(true);
                        }}
                      >
                        Падаан харах
                      </button>
                    ) : (
                      <button
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => handleViewImages(row.original)}
                      >
                        Падаан харах
                      </button>
                    )}

                    {showModal && modalData?.id === row.original.id && (
                      <ImageModal
                        data={modalData}
                        onClose={() => setShowModal(false)}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {row.original.images?.length > 0 && (
                  <>
                    {new Date(row.original.createdDate) >
                    new Date("2025-04-30") ? (
                      <button
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => {
                          setModalData(row.original);
                          setShowModal(true);
                        }}
                      >
                        Падаан харах
                      </button>
                    ) : (
                      <button
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => handleViewImages(row.original)}
                      >
                        Падаан харах
                      </button>
                    )}

                    {showModal && modalData?.id === row.original.id && (
                      <ImageModal
                        data={modalData}
                        onClose={() => setShowModal(false)}
                      />
                    )}
                  </>
                )}
              </>
              // <button
              //   className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
              //   onClick={() => handleViewImages(row.original)}
              // >
              //   Зураг харах
              // </button>
            )}
          </div>
        ),
      },
    ],
    [infoServiceType, infoStatus, user]
  );

  return (
    <div className="min-h-screen p-2 lg:p-6 mt-10 lg:mt-0">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <h1 className="text-xl font-bold">Тавтай морил, {user.username}!</h1>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
        >
          Гарах
        </button>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          onClose={() => setToast({ show: false, message: "" })}
        />
      )}

      <h1 className="text-2xl font-bold mb-4">Дуудлага бүртгэл</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <div className="flex  justify-between h-10 items-center bg-blue-100 p-4 rounded shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-semibold lg:text-base lg:font-bold">
            Нийт Дуудлага
          </h2>
          <p>{orderStats.total}</p>
        </div>
        <div className="flex  justify-between h-10 items-center bg-yellow-100 p-4 rounded shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-semibold lg:text-base lg:font-bold">
            Хүлээгдэж буй
          </h2>
          <p>{orderStats.pending}</p>
        </div>
        <div className="flex  justify-between h-10 items-center bg-red-100 p-4 rounded shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-semibold lg:text-base lg:font-bold">
            Дуудлага хүлээн авсан
          </h2>
          <p>{orderStats.on_call}</p>
        </div>
        <div className="flex  justify-between h-10 items-center bg-green-100 p-4 rounded shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-semibold lg:text-base lg:font-bold">
            Шийдэгдсэн
          </h2>
          <p>{orderStats.resolved}</p>
        </div>
        <div className="flex  justify-between h-10 items-center bg-blue-200 p-4 rounded shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-semibold lg:text-base lg:font-bold">
            Засварын төв дээр авчирсан
          </h2>
          <p>{orderStats.on_service}</p>
        </div>
        <div className="flex  justify-between h-10 items-center bg-gray-200 p-4 rounded shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-semibold lg:text-base lg:font-bold">
            Засах боломжгүй
          </h2>
          <p>{orderStats.no_service}</p>
        </div>
        <div className="flex  justify-between h-10 items-center bg-pink-200 p-4 rounded shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-semibold lg:text-base lg:font-bold">
            Цуцалсан
          </h2>
          <p>{orderStats.return}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        <div className="mb-0 lg:mb-4 w-full sm:w-1/2 lg:w-1/4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="statusFilter"
          >
            Төлөвөөр шүүх:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => handleFilterChange(e)}
            className="border p-2 rounded w-full"
          >
            <option value="">Бүгд</option>
            {infoStatus.map((status) => (
              <option key={status.pk} value={status.pk}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-0 lg:mb-4 w-full sm:w-1/2 lg:w-1/4">
          <label className="block text-sm font-medium mb-1" htmlFor="startDate">
            Эхлэх огноо:
          </label>
          <input
            type="date"
            id="startDate"
            value={dateFilter}
            onChange={(e) => handleDateFilterChange(e, "start")}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-0 lg:mb-4 w-full sm:w-1/2 lg:w-1/4">
          <label className="block text-sm font-medium mb-1" htmlFor="endDate">
            Дуусах огноо:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDateFilter}
            onChange={(e) => handleDateFilterChange(e, "end")}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-0 lg:mb-4 w-full sm:w-1/2 lg:w-1/4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="serviceTypeFilter"
          >
            Үйлчилгээний төрлөөр шүүх:
          </label>
          <select
            id="serviceTypeFilter"
            value={serviceTypeFilter}
            onChange={(e) => handleServiceTypeFilterChange(e)}
            className="border p-2 rounded w-full"
          >
            <option value="">Бүгд</option>
            {infoServiceType.map((serviceType) => (
              <option key={serviceType.pk} value={serviceType.pk}>
                {serviceType.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-2 lg:mb-4">
        <h2 className="text-lg font-bold">Нийт үнийн дүн:</h2>
        <p>{calculateTotalPrice()}₮</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mb-0 lg:mb-6 hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105"
          onClick={newOrderCreate}
        >
          Шинэ дуудлага бүртгэх
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2 lg:mb-6 ml-0 lg:ml-4 hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
          onClick={exportToExcel}
        >
          Excel файл руу экспортлох
        </button>

        <button
          className="bg-red-500 text-white px-4 py-2 rounded mb-2 lg:mb-6 ml-0 lg:ml-4 hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
          onClick={exportImagesToPDF}
        >
          Зургуудыг PDF болгох
        </button>
      </div>

      <Table columns={columns} data={filteredOrders} />
      {/* <ResponsiveCardLayout columns={columns} data={filteredOrders} /> */}

      {isModalOpen && (
        <Modal
          setIsModalOpen={setIsModalOpen}
          Order={isEdit ? selectedOrder : newOrder}
          setOrder={isEdit ? setSelectedOrder : setNewOrder}
          branches={branches}
          infoServiceType={infoServiceType}
          handleAddOrder={handleAddOrder}
        />
      )}

      {/* {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-3xl animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Дуудлага бүртгэл Харах</h2>
            {user.permission == "K" ? (
              <p className="mb-2">
                <strong>ID:</strong> {selectedOrder.id}
              </p>
            ) : (
              ""
            )}
            <p className="mb-2">
              <strong>Бүртгэл үүсгэсэн хэрэглэгч:</strong>{" "}
              {selectedOrder.creted_user.TCUSERNAME}
            </p>
            <p className="mb-2">
              <strong>Засварласан хэрэглэгч:</strong>{" "}
              {selectedOrder.fixed_user?.TCUSERNAME || ""}
            </p>
            <p className="mb-2">
              <strong>Салбар:</strong> {selectedOrder.infoCUBranch.name}
            </p>
            <p className="mb-2">
              <strong>Нийт үнэ:</strong> ₮
              {typeof selectedOrder.totalPrice === "number"
                ? selectedOrder.totalPrice.toFixed(2)
                : parseFloat(selectedOrder.totalPrice || 0).toFixed(2)}
            </p>
            <p className="mb-2">
              <strong>Төлөв:</strong>{" "}
              {ShowOrderStatusName(selectedOrder.status)}
            </p>

            <p className="mb-4">
              <strong>Тайлбар:</strong> {selectedOrder.description}
            </p>

            <p className="mb-4">
              <strong>Засварын ангилал:</strong>{" "}
              {options
                .filter((opt) =>
                  selectedOrder.service_types
                    ? selectedOrder.service_types.includes(opt.value)
                    : false
                )
                .map((opt) => opt.label)
                .join(", ")}
            </p>

            <h3 className="text-lg font-bold mb-2">Барааны мэдээлэл</h3>
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Барааны зураг</th>
                  <th className="border px-4 py-2">Барааны нэр</th>
                  <th className="border px-4 py-2">Тоо ширхэг</th>
                  <th className="border px-4 py-2">Дэд нийт үнэ</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.product_details.map((product, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">
                      {product.image ? (
                        <img
                          src={`${API_URL}${product.image}`}
                          alt={product.productName}
                          className="h-16 w-16 object-cover"
                        />
                      ) : (
                        "Зураг алга"
                      )}
                    </td>
                    <td className="border px-4 py-2">{product.productName}</td>
                    <td className="border px-4 py-2">{product.quantity}</td>
                    <td className="border px-4 py-2">
                      ₮{(product.quantity * product.itemPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-4">
              <strong>Захиалгын огноо:</strong>{" "}
              {new Date(selectedOrder.createdDate).toLocaleDateString("mn-MN")}
            </p>

            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                onClick={() => setIsViewModalOpen(false)}
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )} */}

      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold">
                Дуудлага бүртгэл Харах
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
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
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.permission == "K" && (
                  <div>
                    <p className="text-sm text-gray-600">Падааны №:</p>
                    <p className="font-medium">{selectedOrder.id}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">
                    Бүртгэл үүсгэсэн хэрэглэгч
                  </p>
                  <p className="font-medium">
                    {selectedOrder.creted_user.TCUSERNAME}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Засварласан хэрэглэгч</p>
                  <p className="font-medium">
                    {selectedOrder.fixed_user?.TCUSERNAME || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Салбар</p>
                  <p className="font-medium">
                    {selectedOrder.infoCUBranch.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Нийт үнэ</p>
                  <p className="font-medium">
                    ₮
                    {typeof selectedOrder.totalPrice === "number"
                      ? selectedOrder.totalPrice.toFixed(2)
                      : parseFloat(selectedOrder.totalPrice || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Төлөв</p>
                  <p className="font-medium">
                    {ShowOrderStatusName(selectedOrder.status)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-600">Тайлбар</p>
                <p className="font-medium">
                  {selectedOrder.description || "-"}
                </p>
              </div>

              {/* Service Types */}
              <div>
                <p className="text-sm text-gray-600">Засварын ангилал</p>
                <p className="font-medium">
                  {options
                    .filter((opt) =>
                      selectedOrder.service_types
                        ? selectedOrder.service_types.includes(opt.value)
                        : false
                    )
                    .map((opt) => opt.label)
                    .join(", ") || "-"}
                </p>
              </div>

              {/* Products Table */}
              <div>
                <h3 className="text-lg font-bold mb-3">Барааны мэдээлэл</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Зураг
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Нэр
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Тоо ширхэг
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Үнэ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.product_details.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {product.image ? (
                              <img
                                src={`${API_URL}${product.image}`}
                                alt={product.productName}
                                className="h-12 w-12 md:h-16 md:w-16 object-cover rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 md:h-16 md:w-16 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">
                                  Зураг алга
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.quantity}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ₮
                              {(product.quantity * product.itemPrice).toFixed(
                                2
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Date */}
              <div>
                <p className="text-sm text-gray-600">Захиалгын огноо</p>
                <p className="font-medium">
                  {new Date(selectedOrder.createdDate).toLocaleDateString(
                    "mn-MN"
                  )}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
                onClick={() => setIsViewModalOpen(false)}
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
