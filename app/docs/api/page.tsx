'use client'

import { useEffect, useState } from 'react'
import './swagger-ui.css'

export default function APIDocsPage() {
  const [SwaggerUI, setSwaggerUI] = useState<any>(null)
  const [spec, setSpec] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSwaggerAndSpec() {
      try {
        // Dynamic import for client-side only
        const SwaggerModule = await import('swagger-ui-react')
        setSwaggerUI(() => SwaggerModule.default)
        
        // Load OpenAPI spec
        const response = await fetch('/api/openapi')
        if (!response.ok) throw new Error('Failed to load API spec')
        
        const openApiSpec = await response.json()
        setSpec(openApiSpec)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documentation')
      } finally {
        setLoading(false)
      }
    }

    loadSwaggerAndSpec()
  }, [])

  if (loading) {
    return (
      <div className="container py-20">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-20">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Documentation Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hotelsaver.ng API Documentation
              </h1>
              <p className="text-gray-600 mt-2">
                Interactive API documentation for hotel booking, negotiation, and administration
              </p>
            </div>
            
            <div className="flex gap-3">
              <a 
                href="/API_DOCUMENTATION.md" 
                target="_blank"
                className="btn btn-ghost"
              >
                📖 Full Guide
              </a>
              <a 
                href="/api/openapi" 
                target="_blank"
                className="btn btn-ghost"
              >
                📋 OpenAPI Spec
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">🚀 Quick Start</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Public APIs:</strong> No authentication required - Test negotiate, booking, services</p>
            <p><strong>Admin APIs:</strong> Require <code className="bg-blue-100 px-1 rounded">x-admin-key</code> header - Hotel management, metrics, availability</p>
            <p><strong>Base URL:</strong> <code className="bg-blue-100 px-1 rounded">/api</code></p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">✅ Try These First</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>GET</strong> /admin/metrics - Platform stats</li>
              <li>• <strong>POST</strong> /negotiate - Get hotel discounts</li>
              <li>• <strong>GET</strong> /services/search - Find services</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2">🔑 Admin Access</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Add header: <code className="bg-orange-100 px-1 rounded">x-admin-key: your-key</code></li>
              <li>• Hotel management endpoints</li>
              <li>• CSV availability import</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="container pb-20">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {SwaggerUI && spec && (
            <SwaggerUI 
              spec={spec}
              deepLinking={true}
              displayOperationId={false}
              defaultModelsExpandDepth={1}
              defaultModelExpandDepth={1}
              docExpansion="list"
              filter={true}
              showExtensions={true}
              showCommonExtensions={true}
              tryItOutEnabled={true}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-semibold mb-3">🔗 Resources</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/API_DOCUMENTATION.md" className="hover:text-white">Complete API Guide</a></li>
                <li><a href="/api/openapi" className="hover:text-white">OpenAPI JSON</a></li>
                <li><a href="/" className="hover:text-white">Hotelsaver.ng Home</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">🎯 Key Features</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Real-time hotel negotiation</li>
                <li>Nigerian market focus</li>
                <li>Admin hotel management</li>
                <li>Local service booking</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">💬 Support</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="https://wa.me/2347077775545" className="hover:text-white">WhatsApp Support</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Form</a></li>
                <li><a href="/about" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>Hotelsaver.ng API Documentation • Built with OpenAPI 3.0 & Swagger UI</p>
          </div>
        </div>
      </div>
    </div>
  )
}