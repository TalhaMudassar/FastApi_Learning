'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import AdminOnly from '@/components/AdminOnly';

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const shippingOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

const AdminShippingUpdateStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchUserId, setSearchUserId] = useState("");

  // Fetch orders with optional status filter and user_id
  const fetchOrders = async (statusFilter = "", userId = "") => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders/admin/all", {
        params: {
          shipping_status: statusFilter || undefined,
          user_id: userId || undefined,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFilterChange = (e) => {
    const selected = e.target.value;
    setFilterStatus(selected);
    fetchOrders(selected, searchUserId);
  };

  const handleUserSearch = () => {
    fetchOrders(filterStatus, searchUserId);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/shippings/status/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, shipping_status: { ...order.shipping_status, status: newStatus } }
            : order
        )
      );
    } catch (err) {
      alert("Failed to update shipping status");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading orders...</div>;

  return (
    <AdminOnly>
      <div className="max-w-6xl mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-6">All Orders & Shipping Status</h1>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Shipping Status:</label>
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="border rounded px-3 py-1"
            >
              <option value="">All</option>
              {shippingOptions.map((status) => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">User ID:</label>
            <input
              type="number"
              placeholder="Enter user ID"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="border rounded px-3 py-1 w-32"
            />
            <button
              onClick={handleUserSearch}
              className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border rounded p-4 mb-6 shadow">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${statusColors[order.shipping_status?.status]}`}>
                    {order.shipping_status?.status?.toUpperCase()}
                  </span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={order.shipping_status?.status || ""}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  >
                    {shippingOptions.map((status) => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                Placed on: {new Date(order.created_at).toLocaleString()}
              </p>

              <div className="mt-3 text-sm text-gray-700">
                <strong>User ID:</strong> {order.user_id} <br />
                <strong>Shipping Address:</strong><br />
                {order.shipping_address.address_line1}, {order.shipping_address.address_line2},<br />
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code},<br />
                {order.shipping_address.country}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Order Items:</h3>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderitems?.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">{item.product?.title || "N/A"}</td>
                        <td className="p-2">₹{item.price}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right font-bold mt-2">
                Total: ₹{order.total_price}
              </div>
            </div>
          ))
        )}
      </div>
    </AdminOnly>
  );
};

export default AdminShippingUpdateStatusPage;
