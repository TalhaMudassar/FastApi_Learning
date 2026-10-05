'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';

const statusColors = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/api/payments');
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  };

  
  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Payments</h1>

      {payments.length === 0 ? (
        <p className="text-gray-600">No payments found.</p>
      ) : (
        payments.map((payment) => (
          <div
            key={payment.id}
            className="border rounded-lg shadow-md p-4 mb-4 bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">
                Payment #{payment.id} (Order #{payment.order_id})
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[payment.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {payment.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              Amount: <span className="font-semibold">₹{payment.amount}</span>
            </p>

            <p className="text-sm text-gray-600 mb-1">
              Gateway: <span className="font-semibold">{payment.payment_gateway}</span>
            </p>

            <p className="text-sm">
              Paid:{" "}
              <span
                className={`font-semibold ${
                  payment.is_paid ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {payment.is_paid ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        ))
      )}
    </div>
  );
}
