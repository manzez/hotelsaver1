
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './datepicker.css'

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
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [budgetKey, setBudgetKey] = useState('u80')
  const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment'>('any')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams({
      city,
      checkIn: startDate?.toISOString() || '',
      checkOut: endDate?.toISOString() || '',
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
      <div className="search-row">
        <select className="input md:w-44" value={city} onChange={e => setCity(e.target.value)}>
          <option value="">Where are you going?</option>
          {cities.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="md:w-60 dates flex items-center gap-2">
          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Check-in"
            className="input"
            dateFormat="EEE dd MMM"
          />
          <span className="dash">–</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            placeholderText="Check-out"
            className="input"
            dateFormat="EEE dd MMM"
          />
        </div>

        <div className="input md:w-56 flex items-center justify-between gap-2">
          <label className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Adults</span>
            <input type="number" min={1} value={adults} onChange={e => setAdults(parseInt(e.target.value || '1'))} className="w-12 border rounded px-2 h-8" />
          </label>
          <span className="text-gray-300">|</span>
          <label className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Children</span>
            <input type="number" min={0} value={children} onChange={e => setChildren(parseInt(e.target.value || '0'))} className="w-12 border rounded px-2 h-8" />
          </label>
        </div>

        <div className="input md:w-32 flex items-center justify-between text-sm">
          <span className="text-gray-500">Rooms</span>
          <input type="number" min={1} value={rooms} onChange={e => setRooms(parseInt(e.target.value || '1'))} className="w-12 border rounded px-2 h-8" />
        </div>

        <select className="select md:w-48" value={budgetKey} onChange={e => setBudgetKey(e.target.value)}>
          {budgets.map(b => (
            <option key={b.key} value={b.key}>{b.label}</option>
          ))}
        </select>

        <button type="submit" className="btn-primary md:w-32">Search</button>
      </div>

      <div className="flex justify-center gap-2 mt-3">
        {['any', 'hotel', 'apartment'].map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setStayType(option as typeof stayType)}
            className={`tab ${stayType === option ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </form>
  )
}
