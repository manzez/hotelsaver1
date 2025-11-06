'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HotelPortalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would call an API to authenticate the user.
    // For this example, we'll use a mock authentication.
    if (email === 'hotel@example.com' && password === 'password') {
      // Store a token or session information in local storage or cookies
      localStorage.setItem('hotel-auth-token', 'mock-token');
      router.push('/hotel-portal/bookings');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Hotel Portal Login</h1>
      <form onSubmit={handleLogin} className="max-w-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Login
        </button>
      </form>
    </div>
  );
}
