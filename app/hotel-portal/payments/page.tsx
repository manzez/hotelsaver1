'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock data for payments. In a real application, this would be fetched from an API.
const mockPayments = [
  { id: 'PAY1672532400000', bookingId: 'BK1672532400000', amount: '₦75,000', date: '2025-12-01', status: 'Paid' },
  { id: 'PAY1672618800000', bookingId: 'BK1672618800000', amount: '₦90,000', date: '2025-12-03', status: 'Paid' },
  { id: 'PAY1672705200000', bookingId: 'BK1672705200000', amount: '₦45,000', date: '2025-12-10', status: 'Refunded' },
];

export default function HotelPortalPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState(mockPayments);

  useEffect(() => {
    const token = localStorage.getItem('hotel-auth-token');
    if (!token) {
      router.push('/hotel-portal/auth');
    }
  }, [router]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Your Payments</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">{payment.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.bookingId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
