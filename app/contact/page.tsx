'use client'
import {useMemo, useState} from 'react'

export default function Contact(){
	const [ok, setOk] = useState(false)
	const [form, setForm] = useState({ name: '', email: '', message: '' })
	const supportEmail = useMemo(() => process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@hotelsaver.ng', [])

	function submit(e:React.FormEvent){
		e.preventDefault();
		setOk(true)
	}

	return (
		<div className='py-10 max-w-xl'>
			<h1 className='text-2xl font-bold mb-3'>Contact Us</h1>
			<p className='text-sm text-gray-600 mb-4'>
				Phone/WhatsApp: <a className='text-brand-green' href='https://wa.me/2347077775545' target='_blank' rel='noreferrer'>+234 707 777 55 45</a><br/>
				Email: <a className='text-brand-green' href={`mailto:${supportEmail}`}>{supportEmail}</a><br/>
				Address: Suite 3004, Anbeez Plaza, Plot 16 Ndola Crescent, Wuse Zone 5, FCT, Abuja
			</p>
			<form onSubmit={submit} className='grid gap-3'>
				<input className='input' placeholder='Your name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
				<input type='email' className='input' placeholder='Email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
				<textarea className='min-h-[120px] rounded-md border border-gray-300 px-3 py-2' placeholder='Message' value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
				<div className='flex gap-3'>
					<button className='btn-primary px-5'>Send</button>
					<a href='https://wa.me/2347077775545' target='_blank' rel='noreferrer' className='btn-ghost px-5'>WhatsApp</a>
					<a href={`mailto:${supportEmail}`} className='btn-ghost px-5'>Email us</a>
				</div>
			</form>
			{ok && <div className='mt-3 text-sm text-brand-green'>Thanks! We’ll get back to you shortly.</div>}
			<div className='mt-6 text-sm text-gray-600'>
				Socials:
				<a className='text-brand-green ml-2' href='https://facebook.com' target='_blank' rel='noreferrer'>Facebook</a> •
				<a className='text-brand-green ml-2' href='https://instagram.com' target='_blank' rel='noreferrer'>Instagram</a> •
				<a className='text-brand-green ml-2' href='https://x.com' target='_blank' rel='noreferrer'>X</a>
			</div>
			<div className='mt-3 text-xs text-gray-500'>Typical response time: under 24 hours.</div>
		</div>
	)
}