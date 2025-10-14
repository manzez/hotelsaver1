// app/page.tsx (Next.js App Router) or pages/index.tsx (Pages Router)
import SearchBar from '@/components/SearchBar'
import CategoryTabs from '@/components/CategoryTabs'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between">
        <CategoryTabs active="hotels" />
        <div className="text-sm text-gray-600">Services offered across Nigeria</div>
      </div>

      <section className="mt-4 relative overflow-hidden rounded-xl bg-[radial-gradient(70%_70%_at_50%_0%,#e8fff1_0%,transparent_70%)] card border-0">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Save on hotels &amp; apartments — negotiate instantly
          </h1>
        <p className="mt-2 text-gray-600">Simple search • Clear budgets • Real-time offers (≤ 7s)</p>
          <div className="mt-4">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Food Section */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Best Food and Restaurants</h2>
            <p className="text-sm text-gray-600">
              Try: <i>&quot;I want fresh pounded yam with egusi soup&quot;</i>
            </p>
          </div>
          <Link href="/food" className="btn-ghost">Browse all restaurants</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
          <div className="md:col-span-8 card overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img
              src="/images/food/jollof-rice.jpg"
              alt="Jollof Rice"
              className="h-64 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">Jollof Rice</h3>
              <p className="text-sm text-gray-600 mt-1">Traditional Nigerian party jollof with fried chicken and plantains</p>
            </div>
          </div>

          <div className="md:col-span-4 grid grid-rows-2 gap-4">
            <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <img
                src="/images/food/pounded-yam.jpg"
                alt="Pounded Yam and Egusi"
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold">Pounded Yam &amp; Egusi</h3>
              </div>
            </div>
            <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <img
                src="/images/food/meat-pie.jpg"
                alt="Meat Pie"
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold">Meat Pie</h3>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 card overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img
              src="/images/food/paella.jpg"
              alt="Paella"
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">Paella</h3>
              <p className="text-sm text-gray-600 mt-1">Spanish-inspired rice dish with seafood</p>
            </div>
          </div>

          <div className="md:col-span-6 card overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img
              src="/images/food/pizza.jpg"
              alt="Pizza"
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">Pizza</h3>
              <p className="text-sm text-gray-600 mt-1">Freshly baked with local toppings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hair & Beauty */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Hair and Beauty</h2>
            <p className="text-sm text-gray-600">Try: <i>&quot;I need my hair braided urgently&quot;</i></p>
          </div>
          <Link href="/services?category=beauty" className="btn-ghost">Browse beauty services</Link>
        </div>
        <div className="grid-cards mt-4">
          {[
            {title:'Professional Braiding',img:'https://images.unsplash.com/photo-1595475883362-5d6c3616a9a1?w=800&auto=format&fit=crop',desc:'Expert braiding styles for black hair'},
            {title:'Nail Art & Care',img:'https://images.unsplash.com/photo-1607778835362-8b8c3c4b5c1a?w=800&auto=format&fit=crop',desc:'Beautiful nail designs and treatments'},
            {title:'Eyelash Extensions',img:'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop',desc:'Luxurious lash extensions for black women'},
            {title:'Hair Extensions',img:'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&auto=format&fit=crop',desc:'Premium hair extensions and styling'}
          ].map((s,i)=>(
            <div className="card overflow-hidden hover:shadow-lg transition-shadow" key={i}>
              <img src={s.img} className="h-44 w-full object-cover" alt={s.title}/>
              <div className="p-4">
                <div className="font-semibold">{s.title}</div>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Original Services */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Explore Local Services</h2>
            <p className="text-sm text-gray-600">Various services available in your area</p>
          </div>
          <Link href="/services" className="btn-ghost">Browse all services</Link>
        </div>
        <div className="grid-cards mt-4">
          {[
            {title:'Massage therapists',img:'https://picsum.photos/seed/svc1/800/500',desc:'Relaxation & deep-tissue at your location'},
            {title:'Hair & makeup',img:'https://picsum.photos/seed/svc2/800/500',desc:'Braids, styling, nails & more'},
            {title:'Cleaning services',img:'https://picsum.photos/seed/svc3/800/500',desc:'Home & office cleaners on-demand'}
          ].map((s,i)=>(
            <div className="card overflow-hidden hover:shadow-lg transition-shadow" key={i}>
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
