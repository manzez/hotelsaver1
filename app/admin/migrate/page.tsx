// app/admin/migrate/page.tsx - Admin interface for hotel migration
'use client';

import { useState, useEffect } from 'react';

interface MigrationStatus {
  connected: boolean;
  hotelCount: number;
  activeHotelCount: number;
  lastUpdated?: string;
  message: string;
}

export default function MigrationPage() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/admin/migrate-hotels', {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'your-secret-admin-key'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setMessage('Failed to check database status');
      }
    } catch (error) {
      console.error('Status check failed:', error);
      setMessage('Error checking database status');
    }
  };

  const runMigration = async () => {
    if (!confirm('This will migrate all hotels from JSON to database. Continue?')) {
      return;
    }

    setLoading(true);
    setMessage('Starting migration...');

    try {
      const response = await fetch('/api/admin/migrate-hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'your-secret-admin-key'
        },
        body: JSON.stringify({ action: 'migrate' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Migration successful! ${data.migratedCount} hotels migrated, ${data.activeCount} active.`);
        await checkStatus(); // Refresh status
      } else {
        setMessage(`❌ Migration failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      setMessage('❌ Migration failed with error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hotel Data Migration</h1>
            <p className="text-gray-600">
              Migrate hotel pricing from JSON files to database for admin portal management
            </p>
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-xl shadow-soft border p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Current Database Status</h2>
            
            {status ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="font-medium">
                    {status.connected ? 'Database Connected' : 'Database Not Connected'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Hotels:</span>
                    <span className="ml-2 font-medium">{status.hotelCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Active Hotels:</span>
                    <span className="ml-2 font-medium">{status.activeHotelCount}</span>
                  </div>
                </div>
                
                {status.lastUpdated && (
                  <div className="text-sm text-gray-600">
                    Last Updated: {new Date(status.lastUpdated).toLocaleString()}
                  </div>
                )}
                
                <div className="text-sm font-medium text-gray-800">
                  {status.message}
                </div>
              </div>
            ) : (
              <div className="text-gray-600">Loading status...</div>
            )}
          </div>

          {/* Migration Action */}
          <div className="bg-white rounded-xl shadow-soft border p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Migration Action</h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• This will clear existing database hotel data</li>
                  <li>• All hotels from lib.hotels.json will be migrated</li>
                  <li>• Discount rates from lib/discounts.json will be applied</li>
                  <li>• Admin portal will become the source of truth for pricing</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={runMigration}
                  disabled={loading}
                  className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Migrating...' : 'Run Migration'}
                </button>
                
                <button
                  onClick={checkStatus}
                  className="btn-ghost"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {message && (
            <div className="bg-white rounded-xl shadow-soft border p-6">
              <h2 className="text-xl font-bold mb-4">Migration Results</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap">{message}</pre>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">After Migration</h2>
            <div className="text-blue-800 space-y-2">
              <p>✅ <strong>Admin Portal:</strong> Visit <code>/admin/hotels/pricing</code> to manage hotel prices</p>
              <p>✅ <strong>Real-time Updates:</strong> Price changes take effect immediately</p>
              <p>✅ <strong>Audit Trail:</strong> All price changes are logged with timestamps</p>
              <p>✅ <strong>Bulk Operations:</strong> Update multiple hotels at once</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}