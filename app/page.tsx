
import SearchBar from '@/components/SearchBar'
import CategoryTabs from '@/components/CategoryTabs'
import Link from 'next/link'

export default function Home(){
  return (
    <div className="py-8">
      <div className="flex items-center justify-between">
        <CategoryTabs active="hotels" />
        <div className="text-sm text-gray-600">Services offered across Nigeria</div>
      </div>

      <section className="mt-4 relative overflow-hidden rounded-xl bg-[radial-gradient(70%_70%_at_50%_0%,#e8fff1_0%,transparent_70%)] card border-0">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Save on hotels & apartments — negotiate instantly</h1>
          <p className="mt-2 text-gray-600">Simple search • Clear budgets • Real-time offers (≤ 7s)</p>
          <div className="mt-4">
            <SearchBar />
          </div>
        </div>
      </section>

      <section id="how" className="mt-10 grid md:grid-cols-3 gap-5">
        <div className="card p-6"><h3 className="font-semibold text-lg">1) Search</h3><p className="text-sm text-gray-600 mt-1">Choose city, dates, adults/children, rooms or Apartments, and a budget.</p></div>
        <div className="card p-6"><h3 className="font-semibold text-lg">2) Negotiate</h3><p className="text-sm text-gray-600 mt-1">Tap “Negotiate”. We confirm today’s deal in under 7 seconds.</p></div>
        <div className="card p-6"><h3 className="font-semibold text-lg">3) Book</h3><p className="text-sm text-gray-600 mt-1">Accept the new price, enter details, get instant confirmation.</p></div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Explore Local Services</h2>
            <p className="text-sm text-gray-600">Try: <i>“I need my hair braided urgently”</i></p>
          </div>
          <Link href="/services" className="btn-ghost">Browse all services</Link>
        </div>
        <div className="grid-cards mt-4">
          {[
            {title:'Massage therapists',img:'https://picsum.photos/seed/svc1/800/500',desc:'Relaxation & deep-tissue at your location'},
            {title:'Hair & makeup',img:'https://picsum.photos/seed/svc2/800/500',desc:'Braids, styling, nails & more'},
            {title:'Cleaning services',img:'https://picsum.photos/seed/svc3/800/500',desc:'Home & office cleaners on-demand'}
          ].map((s,i)=>(
            <div className="card overflow-hidden" key={i}>
              <img src={s.img} className="h-44 w-full object-cover" alt={s.title}/>
              <div className="p-4">
                <div className="font-semibold">{s.title}</div>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
