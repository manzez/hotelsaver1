export const metadata = {
  title: 'Privacy Policy',
  description: 'HotelSaver.ng privacy policy (NDPR-aligned)'
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none">
        <p>
          We respect your privacy. This policy explains what data we collect, how we use it, and your rights under the Nigerian Data Protection Regulation (NDPR).
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>Contact details (name, email, phone) provided during booking</li>
          <li>Booking preferences and search context (city, dates, guests)</li>
          <li>Payment status and references (no card data stored on our servers)</li>
        </ul>
        <h2>How we use data</h2>
        <ul>
          <li>To process negotiations and bookings</li>
          <li>To send confirmations and support communications</li>
          <li>To improve our services and user experience</li>
        </ul>
        <h2>Your rights</h2>
        <p>You can request access, correction, or deletion of your personal data by contacting us.</p>
        <h2>Contact</h2>
        <p>For privacy inquiries, message us on WhatsApp at <a className="text-brand-green" href="https://wa.me/2347077775545">+234 707 777 5545</a>.</p>
      </div>
    </div>
  )
}
