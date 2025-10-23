export const metadata = {
  title: 'Terms of Service',
  description: 'HotelSaver.ng terms and conditions'
}

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-4">Terms of Service</h1>
      <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none">
        <h2>Overview</h2>
        <p>
          By accessing or using HotelSaver.ng, you agree to these terms. If you do not agree, please discontinue use.
        </p>
        <h2>Bookings & Negotiations</h2>
        <ul>
          <li>Negotiated offers are time-limited and subject to availability.</li>
          <li>We act as a facilitator between customers and hotels/service providers.</li>
          <li>Booking confirmations will include reference IDs for support.</li>
        </ul>
        <h2>Payments</h2>
        <p>
          For online payments, processing is handled by Paystack. We do not store card details on our servers.
        </p>
        <h2>Cancellations & Refunds</h2>
        <p>
          Hotels and services may have their own cancellation policies. Please review before booking.
        </p>
        <h2>Contact</h2>
        <p>
          For questions, contact us via WhatsApp at{' '}
          <a className="text-brand-green" href="https://wa.me/2347077775545">+234 707 777 5545</a>.
        </p>
      </div>
    </div>
  )
}
