"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductCart from "@/components/ProductCart";

import { CpuChipIcon } from "@/components/ui/TechIcons";

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
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-900">
      {/* High-Visibility Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 p-6 sm:p-10 shadow-xs mb-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-4 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Official Hardware Inventory • Certified Specs</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              All Products
            </h1>
            
            <p className="text-sm sm:text-base text-gray-600 font-normal mt-2 max-w-2xl leading-relaxed">
              Explore high-performance workstation computing, 4K CCTV surveillance optics, and aerial drones calibrated for enterprise deployment.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-gray-50 border border-gray-200 p-4 rounded-2xl">
            <span className="p-3 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <CpuChipIcon className="w-7 h-7" />
            </span>
            <div className="text-xs">
              <p className="text-gray-900 font-bold">100% Genuine Silicon</p>
              <p className="text-blue-600 font-medium">Nationwide TCS Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* High-Contrast Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products by model, brand, or specs (e.g. Dell XPS, 4K Sony, Drone)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3.5 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition bg-white text-gray-900 placeholder:text-gray-400 text-sm shadow-2xs"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl shadow-xs active:scale-95 transition cursor-pointer text-sm flex items-center justify-center gap-2"
        >
          <span>Search</span>
          <span>→</span>
        </button>
      </form>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-gray-900 text-base font-semibold mb-1">No products match your search</p>
          <p className="text-gray-500 text-xs">Try searching for &quot;laptop&quot;, &quot;dell&quot;, &quot;drone&quot;, or &quot;cctv&quot;.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCart key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-12 space-x-3 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs font-medium"
            >
              ← Previous
            </button>

            <span className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl font-mono shadow-2xs">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs font-medium"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPage;