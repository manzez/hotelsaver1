export const metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'HotelSaver.ng refund and cancellation policy'
}

export default function RefundPolicy() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-4">Refund & Cancellation Policy</h1>
      <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none">
        <h2>Hotel Bookings</h2>
        <ul>
          <li>Policies vary by hotel. Please review hotel-specific terms before booking.</li>
          <li>Where allowed, free cancellation up to 24h before check-in.</li>
        </ul>
        <h2>Service Bookings</h2>
        <ul>
          <li>For on-demand services, cancellations within 12h may incur a fee.</li>
        </ul>
        <h2>Online Payments</h2>
        <p>For Paystack payments, eligible refunds are processed back to the original payment method within 5–10 business days.</p>
        <h2>Contact</h2>
        <p>Need help? WhatsApp <a className="text-brand-green" href="https://wa.me/2347077775545">+234 707 777 5545</a>.</p>
      </div>
    </div>
  )
}
