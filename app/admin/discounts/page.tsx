'use client'

import { useState, useEffect } from 'react'
import { getDiscountFor, getDiscountInfo, getDiscountStatistics, getPropertiesByTier, DiscountTier } from '@/lib/discounts'
import { DiscountTester } from '@/lib/discount-testing'

export default function DiscountTestingPage() {
  const [testPropertyId, setTestPropertyId] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [samplesByTier, setSamplesByTier] = useState<any>(null)

  useEffect(() => {
    // Load statistics on component mount
    const statistics = getDiscountStatistics()
    const samples = getPropertiesByTier()
    setStats(statistics)
    setSamplesByTier(samples)
  }, [])

  const handleTestProperty = () => {
    if (!testPropertyId.trim()) return
    
    const result = DiscountTester.test(testPropertyId.trim())
    setTestResults(result)
  }

  const handleValidateAll = () => {
    const validation = DiscountTester.validate()
    alert(validation.isValid ? 'All discounts are valid!' : `Found ${validation.issues.length} issues. Check console for details.`)
  }

  const handleGenerateReport = () => {
    DiscountTester.report()
    alert('Report generated! Check browser console for detailed output.')
  }

  const getTierBadgeClass = (tier: DiscountTier) => {
    switch (tier) {
      case DiscountTier.GOLD:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case DiscountTier.DIAMOND:
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case DiscountTier.PLATINUM:
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discount Testing Dashboard</h1>
        <p className="text-gray-600">Test and manage the tier-based discount system</p>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Properties</h3>
            <p className="text-3xl font-bold text-brand-green">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Discount</h3>
            <p className="text-3xl font-bold text-blue-600">{(stats.averageDiscount * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Max Discount</h3>
            <p className="text-3xl font-bold text-purple-600">{(stats.maxDiscount * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Min Discount</h3>
            <p className="text-3xl font-bold text-yellow-600">{(stats.minDiscount * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Tier Distribution */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🏷️</div>
              <div className="text-sm text-gray-600">No Discount</div>
              <div className="text-xl font-bold">{stats.byTier[DiscountTier.NONE]}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🥇</div>
              <div className="text-sm text-gray-600">Gold (1-24%)</div>
              <div className="text-xl font-bold text-yellow-600">{stats.byTier[DiscountTier.GOLD]}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💎</div>
              <div className="text-sm text-gray-600">Diamond (25-39%)</div>
              <div className="text-xl font-bold text-blue-600">{stats.byTier[DiscountTier.DIAMOND]}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm text-gray-600">Platinum (40%+)</div>
              <div className="text-xl font-bold text-purple-600">{stats.byTier[DiscountTier.PLATINUM]}</div>
            </div>
          </div>
        </div>
      )}

      {/* Test Individual Property */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Individual Property</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter property ID (e.g., eko-hotels-and-suites-lagos)"
            value={testPropertyId}
            onChange={(e) => setTestPropertyId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
          <button
            onClick={handleTestProperty}
            className="bg-brand-green text-white px-6 py-2 rounded-md hover:bg-brand-dark transition-colors"
          >
            Test Property
          </button>
        </div>

        {testResults && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Test Results:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Property ID:</span>
                <div className="text-gray-600">{testResults.propertyId}</div>
              </div>
              <div>
                <span className="font-medium">Base Price:</span>
                <div className="text-gray-600">₦{testResults.basePrice.toLocaleString()}</div>
              </div>
              <div>
                <span className="font-medium">Discount Rate:</span>
                <div className="text-gray-600">{(testResults.discountRate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className="font-medium">Discounted Price:</span>
                <div className="text-green-600 font-bold">₦{testResults.discountedPrice.toLocaleString()}</div>
              </div>
              <div>
                <span className="font-medium">Savings:</span>
                <div className="text-green-600">₦{testResults.savings.toLocaleString()}</div>
              </div>
              <div>
                <span className="font-medium">Tier:</span>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTierBadgeClass(testResults.tier)}`}>
                  {testResults.tierEmoji} {testResults.tierLabel}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-medium">Can Negotiate:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                testResults.hasNegotiation 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults.hasNegotiation ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Testing Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleGenerateReport}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Full Report
          </button>
          <button
            onClick={handleValidateAll}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Validate All Discounts
          </button>
          <button
            onClick={() => DiscountTester.quickTest()}
            className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Run Quick Tests
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Results will be logged to the browser console. Open Developer Tools (F12) to view detailed output.
        </p>
      </div>

      {/* Sample Properties by Tier */}
      {samplesByTier && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Properties by Tier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(samplesByTier).map(([tier, properties]: [string, any]) => (
              <div key={tier}>
                <h4 className={`font-medium mb-3 ${
                  tier === DiscountTier.GOLD ? 'text-yellow-600' :
                  tier === DiscountTier.DIAMOND ? 'text-blue-600' :
                  tier === DiscountTier.PLATINUM ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {tier === DiscountTier.GOLD ? '🥇 Gold' :
                   tier === DiscountTier.DIAMOND ? '💎 Diamond' :
                   tier === DiscountTier.PLATINUM ? '🏆 Platinum' : '🏷️ No Discount'}
                </h4>
                <div className="space-y-2">
                  {properties.slice(0, 5).map((propertyId: string) => {
                    const discount = getDiscountFor(propertyId)
                    return (
                      <div key={propertyId} className="text-xs">
                        <div className="truncate text-gray-900">{propertyId}</div>
                        <div className="text-gray-500">{(discount * 100).toFixed(1)}% off</div>
                      </div>
                    )
                  })}
                  {properties.length > 5 && (
                    <div className="text-xs text-gray-400">
                      +{properties.length - 5} more...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}