export const metadata = {
  title: 'Legal',
  description: 'HotelSaver.ng legal information and policies'
}

export default function LegalHub() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Legal</h1>
      <div className="grid gap-4">
        <a href="/terms" className="card p-4 hover:shadow-soft transition">
          <h2 className="font-semibold text-gray-900">Terms of Service</h2>
          <p className="text-sm text-gray-600">Our terms and conditions for using HotelSaver.ng.</p>
        </a>
        <a href="/privacy" className="card p-4 hover:shadow-soft transition">
          <h2 className="font-semibold text-gray-900">Privacy Policy</h2>
          <p className="text-sm text-gray-600">How we handle your data in line with NDPR.</p>
        </a>
      </div>
    </div>
  )
}
