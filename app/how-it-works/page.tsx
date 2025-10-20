import Link from 'next/link'
import CategoryTabs from '@/components/CategoryTabs'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Navigation - Below Header */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container">
          <div className="flex items-center justify-center">
            <CategoryTabs active="hotels" />
          </div>
        </div>
      </div>

      {/* Hero Section with Palm Trees Background */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=1920&h=1080&fit=crop&auto=format&q=80"
            alt="Beautiful tropical beach with palm trees"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-30 px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            How Negotiation Works
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            We partner with hotels to offer you exclusive discounts on empty rooms, 
            making luxury travel affordable for everyone in Nigeria.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        
        {/* How It Works Process */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            The HotelSaver.ng Process
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">We Partner with Hotels</h3>
              <p className="text-gray-600 leading-relaxed">
                Before you even search, we've already negotiated discount agreements with 120+ hotels 
                across Lagos, Abuja, Port Harcourt, and Owerri. These partnerships allow us to offer 
                you exclusive rates that aren't available anywhere else.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-Time Room Availability</h3>
              <p className="text-gray-600 leading-relaxed">
                Hotels want to fill empty rooms rather than leave them vacant. When you search, 
                our system identifies properties with available inventory and calculates potential 
                savings of 10-50% off regular rates, especially for last-minute bookings.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">You Get the Savings</h3>
              <p className="text-gray-600 leading-relaxed">
                Our negotiation engine instantly applies the best available discount. You see the 
                savings upfront - no bidding, no waiting. Just better prices on quality accommodations, 
                making luxury travel accessible to more Nigerians.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Hotels Love Working With Us
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Fill Empty Rooms:</strong> Better to earn something than nothing on vacant inventory
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Attract New Customers:</strong> Reach price-conscious travelers who become repeat guests
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Guaranteed Bookings:</strong> Pre-negotiated rates ensure immediate confirmations
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Revenue Optimization:</strong> Smart pricing based on demand and availability
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop&auto=format&q=80"
                alt="Luxury hotel lobby"
                className="rounded-xl shadow-lg w-full h-80 object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-green">120+</div>
                  <div className="text-sm text-gray-600">Partner Hotels</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Benefits */}
        <section className="mb-20">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What This Means for You
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Save 10-50%</h3>
                <p className="text-sm text-gray-600">
                  Significant discounts on quality accommodations across Nigeria
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Instant Results</h3>
                <p className="text-sm text-gray-600">
                  See your negotiated price in seconds, no waiting or uncertainty
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏨</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Quality Assured</h3>
                <p className="text-sm text-gray-600">
                  All partner hotels are vetted for quality and service standards
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🇳🇬</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Nigerian Focused</h3>
                <p className="text-sm text-gray-600">
                  Built for Nigerian travelers with local payment options
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How Negotiation Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Behind the Scenes: The Negotiation Engine
          </h2>
          
          <div className="bg-gradient-to-r from-brand-green to-brand-dark rounded-2xl p-8 md:p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">Smart Algorithm at Work</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Availability Check</h4>
                      <p className="text-white/90 text-sm">System checks real-time room availability and occupancy rates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Discount Calculation</h4>
                      <p className="text-white/90 text-sm">Applies pre-negotiated rates based on demand and inventory</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Instant Confirmation</h4>
                      <p className="text-white/90 text-sm">Secures your rate with a 5-minute booking window</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 rounded-xl p-8">
                  <div className="text-4xl font-bold mb-2">5 MIN</div>
                  <div className="text-lg">Booking Window</div>
                  <div className="text-sm text-white/80 mt-2">
                    Once you see your negotiated price, you have 5 minutes to secure it
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">
                  Are the discounted rates guaranteed?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes! Once you see a negotiated price, it's guaranteed for 5 minutes. 
                  This gives you time to review and book without price changes.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">
                  What if no discount is available?
                </h3>
                <p className="text-gray-600 text-sm">
                  Some premium hotels maintain fixed pricing. You'll see "Book Now" 
                  instead of "Negotiate" for these properties, so you know upfront.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">
                  How do I know the hotels are quality?
                </h3>
                <p className="text-gray-600 text-sm">
                  All our partner hotels are vetted for quality, safety, and service. 
                  We only work with reputable properties across Nigeria's major cities.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">
                  Can I cancel or modify my booking?
                </h3>
                <p className="text-gray-600 text-sm">
                  Most bookings offer free cancellation up to 24 hours before check-in. 
                  Specific policies are shown during the booking process.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 text-sm">
                  We support Paystack, Flutterwave, bank transfers, Mastercard, 
                  and pay-at-hotel options - all designed for Nigerian customers.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">
                  Is there a booking fee?
                </h3>
                <p className="text-gray-600 text-sm">
                  No hidden fees! The price you see includes all taxes and charges. 
                  What you negotiate is what you pay.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Save on Your Next Stay?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of Nigerians who are already saving money on quality accommodations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-brand-green text-white px-8 py-4 rounded-lg font-medium hover:bg-brand-dark transition-colors"
              >
                Start Negotiating Now
              </Link>
              <Link
                href="/partner"
                className="bg-white text-brand-green border border-brand-green px-8 py-4 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}