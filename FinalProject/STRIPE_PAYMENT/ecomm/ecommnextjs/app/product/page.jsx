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
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100">
      {/* High-Visibility Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#181c28] via-[#151824] to-[#12151e] border border-white/10 p-6 sm:p-10 shadow-2xl mb-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
              <span>Official Hardware Inventory • Certified Specs</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Hardware &amp; Systems Catalog
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 font-medium mt-3 max-w-2xl leading-relaxed">
              Explore high-performance workstation computing, 4K CCTV surveillance optics, and 8K aerial drones calibrated for enterprise deployment.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-[#11141d]/80 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <span className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
              <CpuChipIcon className="w-8 h-8" />
            </span>
            <div className="text-xs font-mono">
              <p className="text-white font-bold">100% Genuine Silicon</p>
              <p className="text-cyan-400">Nationwide TCS Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* High-Contrast Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by model, chipset (e.g. Dell XPS, 4K Sony Starvis, 8K Drone)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3.5 pl-11 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition bg-[#181c28] text-white placeholder:text-slate-400 font-mono text-sm shadow-md"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer text-sm flex items-center justify-center gap-2"
        >
          <span>Search Systems</span>
          <span>→</span>
        </button>
      </form>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-9 h-9 border-3 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-mono">Querying hardware database...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-[#181c28] rounded-2xl border border-white/10 shadow-xl">
          <p className="text-slate-300 text-base font-semibold mb-1">No hardware items match your query</p>
          <p className="text-slate-400 text-xs font-mono">Try searching for &quot;laptop&quot;, &quot;dell&quot;, &quot;drone&quot;, or &quot;cctv&quot;.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCart key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-12 space-x-3 text-xs font-mono">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2.5 border border-white/10 rounded-xl text-slate-200 bg-[#181c28] hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
            >
              ← Previous
            </button>

            <span className="px-4 py-2.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-xl font-mono shadow-sm">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2.5 border border-white/10 rounded-xl text-slate-200 bg-[#181c28] hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
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