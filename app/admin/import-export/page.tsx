'use client'

import { useState, useRef } from 'react'

interface ImportResult {
  success: boolean
  message: string
  processed?: number
  errors?: string[]
}

export default function ImportExportPage() {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/import-prices', {
        method: 'POST',
        body: formData,
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key'
        }
      })

      const result = await response.json()
      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to upload file. Please try again.'
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const exportAllHotels = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/admin/export-hotels', {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `hotels-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      alert('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const exportBookings = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/admin/export-bookings', {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      alert('Failed to export bookings. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import/Export Data</h1>
        <p className="text-gray-600">Bulk operations for hotel prices and booking data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📥 Import Hotel Prices</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Excel Format Requirements:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Column A: Hotel ID</li>
                <li>• Column B: Base Price (NGN)</li>
                <li>• Column C: Room Type (optional)</li>
                <li>• Column D: Discount Percentage (optional)</li>
              </ul>
              <div className="mt-3">
                <a 
                  href="/admin/sample-import-template.xlsx" 
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  download
                >
                  Download Sample Template
                </a>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportExcel}
                disabled={importing}
                className="hidden"
                id="excel-upload"
              />
              <label 
                htmlFor="excel-upload"
                className={`cursor-pointer ${importing ? 'opacity-50' : ''}`}
              >
                <div className="text-4xl mb-2">📊</div>
                <div className="text-lg font-medium text-gray-900">
                  {importing ? 'Processing...' : 'Choose Excel/CSV File'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Supports .xlsx, .xls, .csv formats
                </div>
              </label>
            </div>

            {importing && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-green"></div>
                <span className="ml-2 text-gray-600">Processing file...</span>
              </div>
            )}

            {importResult && (
              <div className={`p-4 rounded-lg ${
                importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium ${
                  importResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
                </div>
                <div className={`text-sm mt-1 ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.message}
                </div>
                {importResult.processed && (
                  <div className="text-sm text-green-700 mt-1">
                    Processed {importResult.processed} records
                  </div>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-red-800">Errors:</div>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📤 Export Data</h2>
          
          <div className="space-y-4">
            {/* Hotels Export */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Hotel Data Export</h3>
              <p className="text-sm text-gray-600 mb-3">
                Export all hotel information including pricing, room types, and discounts
              </p>
              <button
                onClick={exportAllHotels}
                disabled={exporting}
                className={`w-full px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors ${
                  exporting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {exporting ? 'Exporting...' : 'Export Hotels CSV'}
              </button>
            </div>

            {/* Bookings Export */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Bookings Data Export</h3>
              <p className="text-sm text-gray-600 mb-3">
                Export all bookings with customer details, hotel information, and payment status
              </p>
              <button
                onClick={exportBookings}
                disabled={exporting}
                className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                  exporting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {exporting ? 'Exporting...' : 'Export Bookings CSV'}
              </button>
            </div>

            {/* Custom Export Options */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Custom Exports</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                  Export by City
                </button>
                <button className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                  Export Revenue Report
                </button>
                <button className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                  Export Cancellations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Recent Import/Export Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Hotels Price Update</div>
              <div className="text-sm text-gray-500">Updated 45 hotel prices</div>
            </div>
            <div className="text-sm text-gray-500">2 hours ago</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Bookings Export</div>
              <div className="text-sm text-gray-500">Exported 1,248 booking records</div>
            </div>
            <div className="text-sm text-gray-500">1 day ago</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Room Types Import</div>
              <div className="text-sm text-gray-500">Added new room types for 12 hotels</div>
            </div>
            <div className="text-sm text-gray-500">3 days ago</div>
          </div>
        </div>
      </div>
    </div>
  )
}