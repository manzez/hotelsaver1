import Link from 'next/link'

export default function NegotiateExplainer() {
  return (
    <section id="negotiate-info" className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Take control of the price</h2>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Negotiate in real-time and save up to 50%+ on many hotels. Offers last 5 minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="card p-4 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-900">Find a hotel</h3>
            <p className="text-gray-600 text-sm mt-1">Pick your city and dates. Look for hotels marked as negotiable.</p>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-900">Negotiate price</h3>
            <p className="text-gray-600 text-sm mt-1">Tap “Negotiate price” to see an instant offer with a 5‑minute timer.</p>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-900">Book and save</h3>
            <p className="text-gray-600 text-sm mt-1">Lock in the deal before the timer ends and complete your booking.</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/search" className="btn-primary">Start searching hotels</Link>
        </div>
      </div>
    </section>
  )
}
