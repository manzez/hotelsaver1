'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Lazy load only on client side (avoids SSR bug)
const Datepicker = dynamic(() => import('react-tailwindcss-datepicker'), { ssr: false })


const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
const budgets = [
  { key: 'u80', label: 'Under ₦80k' },
  { key: '80_130', label: '₦80k–₦130k' },
  { key: '130_200', label: '₦130k–₦200k' },
  { key: '200p', label: '₦200k+' }
]

export default function SearchBar() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [dateRange, setDateRange] = useState<{ startDate: string | Date | null, endDate: string | Date | null }>({ startDate: null, endDate: null })
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [budgetKey, setBudgetKey] = useState('u80')
  const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment'>('any')

  const handleDateChange = (newValue: { startDate?: string | Date | null, endDate?: string | Date | null } | null) => {
    if (!newValue) {
      setDateRange({ startDate: null, endDate: null })
      return
    }

    setDateRange({
      startDate: newValue.startDate ?? null,
      endDate: newValue.endDate ?? null
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams({
      city,
      checkIn: dateRange.startDate ? String(dateRange.startDate) : '',
      checkOut: dateRange.endDate ? String(dateRange.endDate) : '',
      adults: String(adults),
      children: String(children),
      rooms: String(rooms),
      budget: budgetKey,
      stayType
    })
    router.push(`/search?${q.toString()}`)
  }

  return (
    
    <form onSubmit={handleSearch} className="card p-3 md:p-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        {/* City selector */}
        <select
          className="input md:w-44"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Where are you going?</option>
          {cities.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Date picker */}
        <div className="md:w-60">
          <Datepicker
            useRange
            asSingle={false}
            value={dateRange.startDate || dateRange.endDate ? dateRange : null}
            onChange={handleDateChange}
            displayFormat="ddd DD MMM"
            primaryColor="green"
            inputClassName="input"
            placeholder="Thu 16 Oct – Fri 17 Oct"
          />

        </div>

        {/* Travellers */}
        <div className="input md:w-56 flex items-center justify-between gap-2">
          <label className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Adults</span>
            <input type="number" min={1} value={adults}
              onChange={e => setAdults(parseInt(e.target.value || '1'))}
              className="w-12 border rounded px-2 h-8" />
          </label>
          <span className="text-gray-300">|</span>
          <label className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Children</span>
            <input type="number" min={0} value={children}
              onChange={e => setChildren(parseInt(e.target.value || '0'))}
              className="w-12 border rounded px-2 h-8" />
          </label>
        </div>

        {/* Rooms */}
        <div className="input md:w-32 flex items-center justify-between text-sm">
          <span className="text-gray-500">Rooms</span>
          <input type="number" min={1} value={rooms}
            onChange={e => setRooms(parseInt(e.target.value || '1'))}
            className="w-12 border rounded px-2 h-8" />
        </div>

        {/* Budget */}
        <select
          className="select md:w-48"
          value={budgetKey}
          onChange={(e) => setBudgetKey(e.target.value)}
        >
          {budgets.map(b => (<option key={b.key} value={b.key}>{b.label}</option>))}
        </select>

        <button type="submit" className="btn-primary md:w-32">Search</button>
      </div>

      {/* Move Hotel/Apartments toggle BELOW the row */}
      <div className="flex justify-center gap-2 mt-3">
        {[
          { key: 'any', label: 'Any' },
          { key: 'hotel', label: 'Hotels' },
          { key: 'apartment', label: 'Apartments' }
        ].map(option => (
          <button
            key={option.key}
            type="button"
            onClick={() => setStayType(option.key as typeof stayType)}
            className={`tab ${
              stayType === option.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </form>
  )
}
