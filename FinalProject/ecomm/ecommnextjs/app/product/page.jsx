"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductCart from "@/components/ProductCart";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 5;

  const fetchProducts = useCallback(async (currentPage = page, query = searchTerm) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (query.trim() !== "") {
        params.append("title", query.trim());
      }

      const res = await axios.get(`${baseUrl}/api/products/search?${params.toString()}`);

      setProducts(res.data.items || []);
      const totalCount = res.data.total || 0;
      setTotalPages(Math.max(1, Math.ceil(totalCount / limit)));
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  // Fetch when page changes
  useEffect(() => {
    fetchProducts(page, searchTerm);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (page === 1) {
      fetchProducts(1, searchTerm);
    } else {
      setPage(1); // Setting page to 1 will trigger useEffect automatically
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
        🛍️ All Products
      </h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by product title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 active:scale-95 transition"
        >
          Search
        </button>
      </form>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCart key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-10 space-x-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <span className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPage;