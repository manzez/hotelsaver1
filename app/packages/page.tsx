'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCart, SERVICE_PACKAGES } from '@/lib/cart-context'
import { SERVICES } from '@/lib/data'
import SafeImage from '@/components/SafeImage'

export default function EventPackages() {
  const { addToCart, state, totals } = useCart()
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [addingPackage, setAddingPackage] = useState<string>('')

  // Get service details for package display
  const getServiceDetails = (serviceId: string) => {
    return SERVICES.find(s => s.id === serviceId)
  }

  // Add entire package to cart
  const handleAddPackage = async (pkg: typeof SERVICE_PACKAGES[0]) => {
    setAddingPackage(pkg.id)
    
    // Add each service in the package to cart
    for (const serviceId of pkg.serviceIds) {
      const service = getServiceDetails(serviceId)
      if (service) {
        const isHire = ['Canopy Hire', 'Chair Hire', 'MC Services', 'Cooler Hire', 'Sound Equipment'].includes(service.category)
        
        addToCart({
          serviceId: service.id,
          title: service.title,
          category: service.category,
          provider: service.provider || 'Event Provider',
          city: service.city,
          quantity: 1,
          unitPrice: service.prices?.[0]?.amountNGN || 0,
          eventDate: '',
          isHireService: isHire,
          image: service.images?.[0]
        })
      }
    }
    
    setTimeout(() => setAddingPackage(''), 2000)
  }

  // Calculate package pricing
  const calculatePackagePrice = (pkg: typeof SERVICE_PACKAGES[0]) => {
    const totalPrice = pkg.serviceIds.reduce((sum, serviceId) => {
      const service = getServiceDetails(serviceId)
      return sum + (service?.prices?.[0]?.amountNGN || 0)
    }, 0)
    
    const discountAmount = Math.round(totalPrice * (pkg.discountPercent / 100))
    const finalPrice = totalPrice - discountAmount
    
    return { totalPrice, discountAmount, finalPrice }
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Event Packages & Bundles</h1>
        <p className="text-gray-600 mt-2">
          Pre-configured event setups with everything you need. Save up to 20% compared to booking individually.
        </p>
      </div>

      {/* Package Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {SERVICE_PACKAGES.map(pkg => {
          const pricing = calculatePackagePrice(pkg)
          const isPopular = pkg.discountPercent >= 15
          
          return (
            <div 
              key={pkg.id}
              className={`card overflow-hidden relative ${
                selectedPackage === pkg.id ? 'ring-2 ring-brand-green' : ''
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              {/* Package Header */}
              <div className={`p-6 ${
                pkg.id.includes('wedding') ? 'bg-gradient-to-br from-pink-50 to-purple-50' :
                pkg.id.includes('birthday') ? 'bg-gradient-to-br from-blue-50 to-cyan-50' :
                pkg.id.includes('corporate') ? 'bg-gradient-to-br from-gray-50 to-blue-50' :
                'bg-gradient-to-br from-green-50 to-emerald-50'
              }`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {pkg.id.includes('wedding') ? '💒' :
                     pkg.id.includes('birthday') ? '🎂' :
                     pkg.id.includes('corporate') ? '🏢' : '🌳'}
                  </div>
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mt-4">
                  <div className="text-sm text-gray-500 line-through">
                    ₦{pricing.totalPrice.toLocaleString()}
                  </div>
                  <div className="text-2xl font-bold text-brand-green">
                    ₦{pricing.finalPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Save ₦{pricing.discountAmount.toLocaleString()} ({pkg.discountPercent}% off)
                  </div>
                </div>
              </div>

              {/* Included Services */}
              <div className="p-4">
                <h4 className="font-semibold text-sm mb-3">Included Services:</h4>
                <div className="space-y-2">
                  {pkg.serviceIds.map(serviceId => {
                    const service = getServiceDetails(serviceId)
                    return service ? (
                      <div key={serviceId} className="flex items-center gap-3 text-sm">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                          <SafeImage
                            src={service.images?.[0] || ''}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{service.title}</div>
                          <div className="text-xs text-gray-500">
                            ₦{(service.prices?.[0]?.amountNGN || 0).toLocaleString()}
                          </div>
                        </div>
                        <span className="text-green-600">✓</span>
                      </div>
                    ) : null
                  })}
                </div>

                {/* Package Actions */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleAddPackage(pkg)}
                    disabled={addingPackage === pkg.id}
                    className="btn btn-primary w-full disabled:opacity-50"
                  >
                    {addingPackage === pkg.id ? '✓ Adding to Cart...' : 
                     pkg.serviceIds.every(id => state.items.some(item => item.serviceId === id)) ? 
                     '📦 Package in Cart' : 'Add Complete Package'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedPackage(selectedPackage === pkg.id ? '' : pkg.id)}
                    className="btn btn-ghost w-full text-sm"
                  >
                    {selectedPackage === pkg.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedPackage === pkg.id && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-sm mb-2">Perfect For:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {pkg.id.includes('wedding-basic') && (
                        <>
                          <li>• Traditional weddings (50-150 guests)</li>
                          <li>• Outdoor ceremonies</li>
                          <li>• Budget-conscious couples</li>
                          <li>• Simple, elegant celebrations</li>
                        </>
                      )}
                      {pkg.id.includes('wedding-premium') && (
                        <>
                          <li>• Large weddings (150+ guests)</li>
                          <li>• Full entertainment needed</li>
                          <li>• Premium celebrations</li>
                          <li>• All-day events</li>
                        </>
                      )}
                      {pkg.id.includes('birthday') && (
                        <>
                          <li>• Birthday parties (all ages)</li>
                          <li>• Backyard celebrations</li>
                          <li>• Music and dancing events</li>
                          <li>• Refreshment service needed</li>
                        </>
                      )}
                      {pkg.id.includes('corporate') && (
                        <>
                          <li>• Business conferences</li>
                          <li>• Company retreats</li>
                          <li>• Professional presentations</li>
                          <li>• Formal gatherings</li>
                        </>
                      )}
                      {pkg.id.includes('outdoor') && (
                        <>
                          <li>• Picnics and BBQs</li>
                          <li>• Sports events</li>
                          <li>• Community gatherings</li>
                          <li>• Large group transportation</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom Package Builder */}
      <div className="card p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Need Something Different?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Custom Package Builder</h3>
            <p className="text-gray-600 mb-4">
              Create your own event package by selecting individual services. 
              Packages with 4+ services automatically get volume discounts.
            </p>
            <Link href="/services" className="btn btn-primary">
              Build Custom Package
            </Link>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Event Planning Consultation</h3>
            <p className="text-gray-600 mb-4">
              Need help planning your event? Our experts can create a 
              personalized package based on your specific needs and budget.
            </p>
            <a href="https://wa.me/2347077775545" className="btn btn-ghost">
              WhatsApp Consultant
            </a>
          </div>
        </div>
      </div>

      {/* Package Comparison */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Package Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Feature</th>
                <th className="text-center py-2">Wedding Basic</th>
                <th className="text-center py-2">Wedding Premium</th>
                <th className="text-center py-2">Birthday Party</th>
                <th className="text-center py-2">Corporate</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b">
                <td className="py-2 font-medium">Canopy/Tent</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
                <td className="text-center">-</td>
                <td className="text-center">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Seating</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Sound System</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">MC Services</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
                <td className="text-center">-</td>
                <td className="text-center">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">DJ Services</td>
                <td className="text-center">-</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
                <td className="text-center">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Live Band</td>
                <td className="text-center">-</td>
                <td className="text-center">✓</td>
                <td className="text-center">-</td>
                <td className="text-center">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Refreshments</td>
                <td className="text-center">-</td>
                <td className="text-center">-</td>
                <td className="text-center">✓</td>
                <td className="text-center">-</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Discount</td>
                <td className="text-center text-green-600 font-bold">15%</td>
                <td className="text-center text-green-600 font-bold">20%</td>
                <td className="text-center text-green-600 font-bold">12%</td>
                <td className="text-center text-green-600 font-bold">10%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Cart Status */}
      {totals.itemCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link href="/cart" className="btn btn-primary flex items-center gap-2 shadow-lg">
            <span>Cart ({totals.itemCount})</span>
            <span>₦{totals.total.toLocaleString()}</span>
          </Link>
        </div>
      )}
    </div>
  )
}