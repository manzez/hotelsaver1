export const metadata = {
  title: 'Cookies Policy',
  description: 'How HotelSaver.ng uses cookies'
}

export default function CookiesPolicy() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-4">Cookies Policy</h1>
      <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none">
        <p>We use minimal cookies to make the site work and improve your experience.</p>
        <h2>Types of cookies we use</h2>
        <ul>
          <li><strong>Essential:</strong> Required for core functionality (e.g., session, navigation).</li>
          <li><strong>Performance:</strong> Optional analytics to improve the product (disabled by default).</li>
        </ul>
        <h2>Managing cookies</h2>
        <p>You can control cookies via your browser settings. Blocking some cookies may impact site functionality.</p>
      </div>
    </div>
  )
}
