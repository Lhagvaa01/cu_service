import React, { useState } from "react";
import html2canvas from "html2canvas";

const ImageModal = ({ data, onClose }) => {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleDownloadAll = () => {
    data.images.forEach((image, index) => {
      const link = document.createElement("a");
      link.href = `https://api.cu.kacc.mn${image.image}`;
      link.download = `padaan-image-${index + 1}.jpg`;
      link.click();
    });
  };

  const handleSaveAsImage = () => {
    const modalContent = document.getElementById("modal-content");

    html2canvas(modalContent, {
      backgroundColor: "#ffffff", // Цагаан background өнгө
      scale: 2, // Өндөр чанар
      logging: false,
      useCORS: true,
      allowTaint: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `padaan-${data.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  if (fullscreenImage) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <button
          className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70"
          onClick={() => setFullscreenImage(null)}
        >
          &times;
        </button>
        <img
          src={fullscreenImage}
          className="max-w-full max-h-full object-contain"
          alt="Fullscreen"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 z-50 overflow-auto p-4 md:p-10 flex justify-center items-start">
      <div
        id="modal-content"
        className="bg-white shadow-xl rounded-lg p-6 w-full max-w-4xl border border-gray-200 relative"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl bg-transparent border-none cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        <img
          src="/Logo.jpg"
          alt="logo"
          className="w-40" // w-10 (2.5rem) болон бусад стильүүдийг тохируулна
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <h2 className="text-xl font-bold mb-4">Засварын падаан</h2>

          <h2 className="text-xl font-bold mb-4">Падаан №: {data.id}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
          <p>
            <strong>Салбар:</strong> {data.infoCUBranch.name}
          </p>
          <p>
            <strong>Үүсгэсэн Огноо:</strong>{" "}
            {new Date(data.createdDate).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
          <p>
            <strong>Засварласан инженер:</strong> {data.fixed_user.TCUSERNAME}
          </p>
          <p>
            <strong>Засварласан Огноо:</strong>{" "}
            {new Date(data.fixedDate).toLocaleString()}
          </p>
        </div>

        <hr className="my-4 border-gray-200" />

        <table className="w-full border mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Бараа</th>
              <th className="border px-4 py-2 text-right">Тоо</th>
              <th className="border px-4 py-2 text-right">Үнэ</th>
            </tr>
          </thead>
          <tbody>
            {data.product_details.map((p, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{p.productName}</td>
                <td className="border px-4 py-2 text-right">{p.quantity}</td>
                <td className="border px-4 py-2 text-right">
                  {p.itemPrice.toLocaleString()}₮
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mb-6">
          <strong>Нийт үнэ:</strong>
          <span className="font-bold text-lg">
            {parseFloat(data.totalPrice).toLocaleString()}₮
          </span>
        </div>

        {/* <p className="mb-5">
          <strong>Засварласан инженер:</strong> {data.fixed_user.TCUSERNAME}
        </p> */}
        <div className="relative mb-5">
          <img
            src="/kaccService.png"
            alt="Засварласан хэрэглэгч"
            className="absolute -top-10 left-40 w-40" // w-10 (2.5rem) болон бусад стильүүдийг тохируулна
          />
          <p className="">
            {" "}
            {/* Зургийн өргөнтэй тэнцүү padding-left */}
            <strong>Засварласан инженер:</strong> {data.fixed_user.TCUSERNAME}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
          <p>
            <strong>Хүлээн авсан хэрэглэгчийн нэр:</strong> {data.receivedName}
          </p>
          <p>
            <strong>Хүлээн авсан хэрэглэгчийн утас:</strong>{" "}
            {data.receivedPhone}
          </p>
        </div>

        {data.images.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Гарын үсэг: </h3>
              {/* <button
                onClick={handleDownloadAll}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Бүгдийг татах
              </button> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group border rounded overflow-hidden"
                >
                  <img
                    src={`https://api.cu.kacc.mn${image.image}`}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() =>
                      setFullscreenImage(`https://api.cu.kacc.mn${image.image}`)
                    }
                    alt={`Attachment ${index + 1}`}
                  />
                  <a
                    href={`https://api.cu.kacc.mn${image.image}`}
                    download={`padaan-image-${index + 1}.jpg`}
                    className="absolute bottom-2 right-2 bg-white text-gray-800 px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Татах
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={handleSaveAsImage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Зураг хадгалах
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Хэвлэх
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
