'use client'

import { useState } from 'react'

export default function AdminTestPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'dev-admin-key-2024'
      console.log('Testing with admin key:', adminKey.substring(0, 10) + '...')
      
      const response = await fetch('/api/admin/test', {
        headers: {
          'x-admin-key': adminKey
        }
      })
      
      const result = await response.json()
      setTestResult(result)
      console.log('Test result:', result)
    } catch (error) {
      console.error('Test error:', error)
      setTestResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testHotelGet = async () => {
    setLoading(true)
    try {
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'dev-admin-key-2024'
      
      const response = await fetch('/api/admin/hotels/eko-hotel-and-suites-lagos', {
        method: 'GET',
        headers: {
          'x-admin-key': adminKey
        }
      })
      
      const result = await response.json()
      setTestResult(result)
      console.log('Hotel GET result:', result)
    } catch (error) {
      console.error('Hotel GET error:', error)
      setTestResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testHotelUpdate = async () => {
    setLoading(true)
    try {
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'dev-admin-key-2024'
      
      const testUpdate = {
        name: 'Eko Hotels and Suites (Updated)',
        city: 'Lagos',
        basePriceNGN: 190000,
        stars: 5,
        type: 'Hotel',
        description: 'Updated description for testing'
      }
      
      const response = await fetch('/api/admin/hotels/eko-hotel-and-suites-lagos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify(testUpdate)
      })
      
      const result = await response.json()
      setTestResult(result)
      console.log('Hotel update result:', result)
    } catch (error) {
      console.error('Hotel update error:', error)
      setTestResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin API Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
        
        <button
          onClick={testHotelGet}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : 'Test Hotel GET'}
        </button>
        
        <button
          onClick={testHotelUpdate}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : 'Test Hotel Update'}
        </button>
      </div>
      
      {testResult && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Test Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h2 className="font-semibold mb-2">Environment Check:</h2>
        <p>NEXT_PUBLIC_ADMIN_API_KEY: {process.env.NEXT_PUBLIC_ADMIN_API_KEY ? 'Set' : 'Not Set'}</p>
        <p>Key value (first 10 chars): {(process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'undefined').substring(0, 10)}...</p>
      </div>
    </div>
  )
}