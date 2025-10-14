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
  const [showGuestPicker, setShowGuestPicker] = useState(false)

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

  const guestSummary = `${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}, ${rooms} room${rooms !== 1 ? 's' : ''}`

  return (
    <form onSubmit={handleSearch} className="card p-4 md:p-6">
      {/* Main Search Row */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center">
        {/* City Select */}
        <div className="w-full md:w-48">
          <select 
            className="input w-full" 
            value={city} 
            onChange={e => setCity(e.target.value)}
          >
            <option value="">Where are you going?</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date Pickers */}
        <div className="w-full md:w-64 flex items-center gap-2">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Check-in"
            className="input flex-1"
            dateFormat="EEE dd MMM"
          />
          <span className="text-gray-400 text-sm">→</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            placeholderText="Check-out"
            className="input flex-1"
            dateFormat="EEE dd MMM"
          />
        </div>

        {/* Guest Picker - Improved Design */}
        <div className="w-full md:w-56 relative">
          <button
            type="button"
            onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="input w-full flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-gray-700">{guestSummary}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showGuestPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Adults</div>
                    <div className="text-xs text-gray-500">Age 13+</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children - FIXED VISIBILITY */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Children</div>
                    <div className="text-xs text-gray-500">Ages 0-12</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Rooms</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{rooms}</span>
                    <button
                      type="button"
                      onClick={() => setRooms(rooms + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuestPicker(false)}
                  className="w-full btn-primary text-sm py-2"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Budget Select */}
        <select 
          className="select w-full md:w-48" 
          value={budgetKey} 
          onChange={e => setBudgetKey(e.target.value)}
        >
          {budgets.map(b => (
            <option key={b.key} value={b.key}>{b.label}</option>
          ))}
        </select>

        {/* Search Button */}
        <button type="submit" className="btn-primary w-full md:w-32 py-3">
          Search
        </button>
      </div>

      {/* Stay Type Tabs */}
      <div className="flex justify-center gap-2 mt-4 flex-wrap">
        {['any', 'hotel', 'apartment'].map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setStayType(option as typeof stayType)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              stayType === option 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </form>
  )
}