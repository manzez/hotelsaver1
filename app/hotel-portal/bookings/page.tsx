'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock data for bookings. In a real application, this would be fetched from an API.
const mockBookings = [
  { id: 'BK1672532400000', customerName: 'Alice Johnson', checkIn: '2025-12-01', checkOut: '2025-12-05', status: 'Confirmed' },
  { id: 'BK1672618800000', customerName: 'Bob Williams', checkIn: '2025-12-03', checkOut: '2025-12-07', status: 'Confirmed' },
  { id: 'BK1672705200000', customerName: 'Charlie Brown', checkIn: '2025-12-10', checkOut: '2025-12-12', status: 'Cancelled' },
];

export default function HotelPortalBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState(mockBookings);

  useEffect(() => {
    const token = localStorage.getItem('hotel-auth-token');
    if (!token) {
      router.push('/hotel-portal/auth');
    }
  }, [router]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Your Bookings</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">{booking.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.checkIn}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.checkOut}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
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
