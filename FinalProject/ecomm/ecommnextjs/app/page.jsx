'use client';

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ProductCart from "@/components/ProductCart";
import axios from "axios";

export default function Home() {
  const [clothing, setClothing] = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductByCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        
        const [clothingRes, electronicsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/products?categories=clothing`),
          axios.get(`${baseUrl}/api/products?categories=electronics`),
        ]);

        setClothing(clothingRes.data.items || []);
        setElectronics(electronicsRes.data.items || []);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductByCategories();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600 py-10">Loading products...</p>;
  }

  return (
    <div className="space-y-10">
      <Hero />

      {/* Clothing Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Clothing</h2>
        {clothing.length === 0 ? (
          <p className="text-gray-600">No clothing products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {clothing.map((product) => (
              <ProductCart key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Electronics Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Electronics</h2>
        {electronics.length === 0 ? (
          <p className="text-gray-600">No electronics products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {electronics.map((product) => (
              <ProductCart key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}