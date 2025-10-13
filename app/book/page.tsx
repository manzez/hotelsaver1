
'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function BookPage(){
  const sp=useSearchParams()
  const propertyId=sp.get('propertyId')||''
  const price=sp.get('price')||''
  const [form,setForm]=useState({name:'',phone:'',email:'',eta:''})
  const [done,setDone]=useState(false)

  async function submit(e:React.FormEvent){
    e.preventDefault()
    const res=await fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({propertyId,negotiationToken:'demo',rooms:1,adults:2,children:0,checkIn:'',checkOut:'',contact:form})})
    if(res.ok) setDone(true)
  }

  if(done) return (<div className="py-10"><div className="card p-6"><h2 className="text-2xl font-semibold">Booking confirmed!</h2><p className="mt-2">We emailed you and admin@hotelsaver.ng.</p></div></div>)

  return (
    <div className="py-10 max-w-xl">
      <h2 className="text-xl font-semibold mb-3">Complete your booking</h2>
      <p className="text-sm text-gray-600 mb-4">Property: {propertyId} {price && `• Accepted price ₦${Number(price).toLocaleString()}`}</p>
      <form onSubmit={submit} className="grid gap-3">
        <input className="input" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="input" placeholder="Phone (WhatsApp)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <input type="email" className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input className="input" placeholder="Time of arrival (e.g. 18:00)" value={form.eta} onChange={e=>setForm({...form,eta:e.target.value})}/>
        <button className="btn-primary">Confirm Booking</button>
      </form>
    </div>
  )
}
