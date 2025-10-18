export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About HotelSaver.ng
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing Nigeria's hospitality industry by connecting travelers with incredible hotel deals 
            while helping hotels maximize their occupancy rates through innovative negotiation technology.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <div className="w-24 h-1 bg-brand-green mx-auto mb-6"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-brand-green mb-4">For Travelers</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                We believe exceptional travel experiences shouldn't break the bank. Our innovative negotiation platform 
                empowers travelers to secure significant savings on premium accommodations across Nigeria's major cities. 
                From Lagos to Abuja, Port Harcourt to Owerri, we're making luxury travel accessible to everyone.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-3">
                  <span className="text-brand-green">✨</span>
                  <span>Negotiate real-time discounts up to 30% off</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-brand-green">✨</span>
                  <span>Access to exclusive hotel deals and packages</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-brand-green">✨</span>
                  <span>Transparent pricing with no hidden fees</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-brand-green mb-4">For Hotels</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                We partner with hotels to optimize their revenue management by filling empty rooms with quality guests. 
                Our smart pricing algorithms help hotels maintain healthy occupancy rates while preserving their brand value 
                and maximizing profitability during low-demand periods.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-3">
                  <span className="text-brand-green">🏨</span>
                  <span>Increase occupancy rates by up to 40%</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-brand-green">🏨</span>
                  <span>Dynamic pricing strategies for optimal revenue</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-brand-green">🏨</span>
                  <span>Access to verified, quality guests</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-gradient-to-br from-brand-green to-emerald-600 rounded-2xl shadow-lg text-white p-8 md:p-12 mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-white/90 leading-relaxed mb-6">
                Founded in the heart of Nigeria's bustling hospitality landscape, HotelSaver.ng was born from a simple observation: 
                countless hotel rooms remain empty each night while travelers struggle to find affordable, quality accommodations. 
                Our founders, passionate about both technology and travel, recognized an opportunity to create a win-win solution.
              </p>
              <p className="text-white/90 leading-relaxed mb-6">
                What started as a small startup with a big dream has evolved into Nigeria's premier hotel negotiation platform. 
                We've facilitated thousands of successful bookings, saved travelers millions of naira, and helped our hotel partners 
                achieve unprecedented occupancy rates. Our innovative approach combines cutting-edge technology with deep understanding 
                of the Nigerian hospitality market.
              </p>
              <p className="text-white/90 leading-relaxed">
                Today, we're proud to serve as the bridge between discerning travelers and exceptional hotels across Nigeria, 
                creating value for everyone in the ecosystem while making memorable travel experiences more accessible than ever before.
              </p>
            </div>
          </div>
        </div>

        {/* Our Team */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Dedicated Team</h2>
            <div className="w-24 h-1 bg-brand-green mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Behind HotelSaver.ng is a passionate team of travel enthusiasts, technology experts, and hospitality professionals 
              working tirelessly to revolutionize how Nigerians experience travel.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-green to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                💼
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Leadership Team</h3>
              <p className="text-gray-600">
                Experienced executives with deep roots in Nigeria's travel and technology sectors, 
                providing strategic vision and industry expertise.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                💻
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Technology Team</h3>
              <p className="text-gray-600">
                Skilled developers and engineers building robust, scalable solutions that power 
                our negotiation platform and ensure seamless user experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🤝
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Success</h3>
              <p className="text-gray-600">
                Dedicated support specialists and relationship managers ensuring every traveler 
                and hotel partner receives exceptional service and support.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">What Drives Us</h3>
            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto">
              Our team is united by a shared passion for making travel more accessible and helping businesses thrive. 
              We're not just building a platform; we're nurturing a community where travelers discover amazing experiences 
              and hotels unlock their full potential. Every negotiation completed, every satisfied customer, and every 
              hotel partner's success story fuels our commitment to excellence and innovation.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🎯
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
            <p className="text-gray-600 text-sm">
              Continuously pushing boundaries with cutting-edge technology and creative solutions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🤝
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust</h3>
            <p className="text-gray-600 text-sm">
              Building lasting relationships through transparency, reliability, and exceptional service.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
              ⭐
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellence</h3>
            <p className="text-gray-600 text-sm">
              Delivering outstanding results and exceeding expectations in everything we do.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🌍
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Impact</h3>
            <p className="text-gray-600 text-sm">
              Creating positive change in Nigeria's hospitality industry and travelers' lives.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the HotelSaver Family</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're a traveler seeking incredible deals or a hotel looking to maximize occupancy, 
            we're here to help you achieve your goals. Join thousands of satisfied customers who trust HotelSaver.ng 
            for their accommodation needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/" 
              className="bg-brand-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors inline-flex items-center gap-2"
            >
              Start Negotiating
              <span>🚀</span>
            </a>
            <a 
              href="/partner" 
              className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              Partner With Us
              <span>🤝</span>
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              Questions? We'd love to hear from you. 
              <a href="/contact" className="text-brand-green hover:text-brand-dark font-medium ml-1">Get in touch</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}