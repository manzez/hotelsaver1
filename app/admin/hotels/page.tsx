"use client";
import React, { useMemo, useState, useEffect } from "react";

type HotelRow = {
  id: string;
  name: string;
  city: string;
  stars: number;
  type: string;
  basePriceNGN: number;
  images: string[];
};

function toCsv(rows: Array<{ id: string; basePriceNGN: number }>) {
  const header = "id,basePriceNGN";
  const body = rows
    .map((r) => `${r.id},${Number.isFinite(r.basePriceNGN) ? r.basePriceNGN : ""}`)
    .join("\n");
  return `${header}\n${body}\n`;
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const cities = ["Lagos", "Abuja", "Port Harcourt", "Owerri"] as const;

export default function AdminHotelsPage() {
  const [rows, setRows] = useState<HotelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("");

  // Fetch hotels from admin API
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/hotels', {
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hotels: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.ok && Array.isArray(data.results)) {
          setRows(data.results);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hotels');
        console.error('Error fetching hotels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      const matchesCity = !city || r.city === city;
      return matchesQ && matchesCity;
    });
  }, [rows, query, city]);

  const [changed, setChanged] = useState<Record<string, number>>({});

  const changedCount = useMemo(() => Object.keys(changed).length, [changed]);

  const handlePriceChange = (id: string, value: string) => {
    const n = Math.max(0, Math.round(Number(value || 0)));
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, basePriceNGN: n } : r)));
    setChanged((prev) => ({ ...prev, [id]: n }));
  };

  const exportChangesCsv = () => {
    const changes = Object.entries(changed).map(([id, price]) => ({ id, basePriceNGN: price }));
    if (changes.length === 0) return;
    const csv = toCsv(changes);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    download(`price-updates-${ts}.csv`, csv);
  };

  const exportAllCsv = () => {
    const all = rows.map((r) => ({ id: r.id, basePriceNGN: r.basePriceNGN }));
    const csv = toCsv(all);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    download(`all-hotel-prices-${ts}.csv`, csv);
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="card p-6 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Hotels</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin · Hotels & Prices</h1>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            onClick={exportAllCsv}
            title="Download current prices for all hotels"
          >
            Export All CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={exportChangesCsv}
            disabled={changedCount === 0}
            title={changedCount === 0 ? "No changes to export" : "Download only changed prices"}
          >
            Export Changes ({changedCount})
          </button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-gray-600">Search</label>
            <input
              className="input"
              placeholder="Search by name or id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">City</label>
            <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 text-sm text-gray-600 flex items-end">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 w-full">
              Changes aren't saved server-side. Use "Export Changes" to download a CSV and run the
              bulk update script locally: <code>npm run update:prices ./your-file.csv</code>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium text-gray-600">Name</th>
              <th className="px-3 py-2 font-medium text-gray-600">ID</th>
              <th className="px-3 py-2 font-medium text-gray-600">City</th>
              <th className="px-3 py-2 font-medium text-gray-600">Stars</th>
              <th className="px-3 py-2 font-medium text-gray-600">Type</th>
              <th className="px-3 py-2 font-medium text-gray-600">Price (₦)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap max-w-[320px] truncate" title={r.name}>
                  {r.name}
                </td>
                <td className="px-3 py-2 text-gray-500 whitespace-nowrap max-w-[420px] truncate" title={r.id}>
                  {r.id}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{r.city}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="text-amber-400">{"★".repeat(r.stars)}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    r.type === 'Apartment' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {r.type}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">₦</span>
                    <input
                      type="number"
                      min={0}
                      className="input w-40"
                      value={r.basePriceNGN}
                      onChange={(e) => handlePriceChange(r.id, e.target.value)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hotels found matching your filters.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin · Hotels & Prices</h1>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            onClick={exportAllCsv}
            title="Download current prices for all hotels"
          >
            Export All CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={exportChangesCsv}
            disabled={changedCount === 0}
            title={changedCount === 0 ? "No changes to export" : "Download only changed prices"}
          >
            Export Changes ({changedCount})
          </button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-gray-600">Search</label>
            <input
              className="input"
              placeholder="Search by name or id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">City</label>
            <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 text-sm text-gray-600 flex items-end">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 w-full">
              Changes aren’t saved server-side. Use "Export Changes" to download a CSV and run the
              bulk update script locally: <code>npm run update:prices ./your-file.csv</code>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium text-gray-600">Name</th>
              <th className="px-3 py-2 font-medium text-gray-600">ID</th>
              <th className="px-3 py-2 font-medium text-gray-600">City</th>
              <th className="px-3 py-2 font-medium text-gray-600">Price (₦)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap max-w-[320px] truncate" title={r.name}>
                  {r.name}
                </td>
                <td className="px-3 py-2 text-gray-500 whitespace-nowrap max-w-[420px] truncate" title={r.id}>
                  {r.id}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{r.city}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">₦</span>
                    <input
                      type="number"
                      min={0}
                      className="input w-40"
                      value={r.basePriceNGN}
                      onChange={(e) => handlePriceChange(r.id, e.target.value)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
