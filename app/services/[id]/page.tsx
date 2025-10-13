
'use client'
import { useState } from 'react'
import { SERVICES } from '@/lib/data'

export default function ServiceDetail({params}:{params:{id:string}}){
  const s = SERVICES.find(x=>x.id===params.id)
  const [people,setPeople]=useState(1)
  const [variant,setVariant]=useState(0)
  const [done,setDone]=useState(false)

  if(!s) return <div className="py-10">Not found</div>

  async function reserve(){
    const res=await fetch('/api/services/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({serviceId:s.id,people,variant})})
    if(res.ok) setDone(true)
  }

  if(done) return <div className="py-10"><div className="card p-6"><h2 className="text-2xl font-semibold">Reservation received!</h2><p className="mt-2">We emailed you and the provider.</p></div></div>

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold">{s.title}</h1>
      <div className="text-sm mt-1"><span className="text-amber-400">{"★".repeat(Math.round(s.rating||5))}</span><span className="text-gray-300">{"☆".repeat(5-Math.round(s.rating||5))}</span> <span className="text-gray-500">({s.reviews} reviews)</span></div>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        {s.images.slice(0,2).map((src,i)=>(<img key={i} src={src} alt={`${s.title}-${i}`} className="h-48 w-full object-cover rounded-md" />))}
      </div>
      <p className="mt-3 text-gray-700">{s.summary}</p>

      <div className="mt-4 grid gap-3 max-w-xl">
        <label className="text-sm text-gray-700">Number of people
          <input type="number" min={1} value={people} onChange={e=>setPeople(parseInt(e.target.value||'1'))} className="input mt-1"/>
        </label>
        <label className="text-sm text-gray-700">Type of service
          <select className="select mt-1" value={variant} onChange={e=>setVariant(parseInt(e.target.value||'0'))}>
            {s.prices.map((p:any,i:number)=>(<option key={i} value={i}>{p.name} — ₦{p.amountNGN.toLocaleString()} • {p.duration}</option>))}
          </select>
        </label>
        <button onClick={reserve} className="btn-primary">Reserve</button>
      </div>
    </div>
  )
}
