import React, { useEffect, useState } from "react";
import { fetchData } from "../api";
import Table from "../components/Table";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await fetchData("products");
      setProducts(
        data.map((product) => [
          product.itemCode,
          product.itemName,
          product.itemPrice,
        ])
      );
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Бараа</h1>
      <Table headers={["Код", "Нэр", "Үнэ"]} rows={products} />
    </div>
  );
};

export default Products;
