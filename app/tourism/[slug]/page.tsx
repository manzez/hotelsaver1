import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import { TOURISM_DESTINATIONS, getTourismBySlug } from '@/lib/tourism'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return TOURISM_DESTINATIONS.map(d => ({ slug: d.slug }))
}

export default function TourismDetail({ params }: { params: { slug: string } }) {
  const place = getTourismBySlug(params.slug)
  if (!place) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="card p-6 text-center">
          <h1 className="text-2xl font-bold">Destination not found</h1>
          <p className="text-gray-600 mt-2">We couldn't find this tourism site.</p>
          <Link href="/" className="btn-ghost mt-4">Back to Home</Link>
        </div>
      </div>
    )
  }

  const mapSrc = place.lat && place.lng
    ? `https://www.google.com/maps?q=${place.lat},${place.lng}&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(place.address)}&output=embed`

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-64 md:h-96">
        <SafeImage src={place.heroImage} alt={place.name} mobileQuery={`${place.name} ${place.state} Nigeria`} className="absolute inset-0 w-full h-full object-cover" fallbackSrc="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&auto=format&fit=crop&q=80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="inline-flex items-center gap-2 text-xs mb-2">
            <span className="bg-white/10 px-2 py-1 rounded-full backdrop-blur">{place.category}</span>
            <span className="bg-white/10 px-2 py-1 rounded-full backdrop-blur">{place.state}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow">{place.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <main className="md:col-span-2 space-y-6">
          <section className="card p-5">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700 leading-relaxed">{place.description}</p>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Highlights</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {place.highlights.map(h => (<li key={h}>{h}</li>))}
              </ul>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-xl font-semibold mb-2">Significance to Nigeria</h2>
            <p className="text-gray-700 leading-relaxed">{place.significance}</p>
          </section>

          {place.gallery && place.gallery.length > 0 && (
            <section className="card p-5">
              <h2 className="text-xl font-semibold mb-3">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {place.gallery.map((src, idx) => (
                  <div key={idx} className="relative h-32 md:h-40 rounded-md overflow-hidden">
                    <SafeImage src={src} alt={`${place.name} ${idx+1}`} mobileQuery={`${place.name} ${place.state} Nigeria`} className="absolute inset-0 w-full h-full object-cover" fallbackSrc={place.heroImage} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="md:col-span-1 space-y-4">
          <div className="card p-4 text-sm">
            <h3 className="font-semibold mb-2">Location & Contact</h3>
            <div className="text-gray-700">
              <div className="mb-2"><span className="font-medium">Address:</span> {place.address}</div>
              <div className="mb-2"><span className="font-medium">State:</span> {place.state}</div>
              <div className="mb-2"><span className="font-medium">Category:</span> {place.category}</div>
              <div className="text-xs text-gray-500">Official contact details may vary by season. We recommend confirming via the respective State Tourism Board or verified guides before travel.</div>
            </div>
            <div className="mt-3 flex gap-2">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">Get directions</a>
              <Link href="/tourism" className="btn-ghost">All sites</Link>
            </div>
          </div>
          <div className="card p-0 overflow-hidden">
            <iframe title="Map" src={mapSrc} className="w-full h-60 border-0" loading="lazy" />
          </div>
        </aside>
      </div>
    </div>
  )
}
