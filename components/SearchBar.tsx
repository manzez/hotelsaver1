'use client'
import { useState, useRef, useEffect } from 'react'
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const guestPickerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
        {/* City Select - Fixed visibility */}
        <div className="w-full md:w-56">
          <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
          <select 
            className="input w-full text-gray-900" 
            value={city} 
            onChange={e => setCity(e.target.value)}
          >
            <option value="" className="text-gray-500">Where are you going?</option>
            {cities.map(c => (
              <option key={c} value={c} className="text-gray-900">{c}</option>
            ))}
          </select>
        </div>

        {/* Date Pickers - Enhanced with continuous range selection */}
        <div className="w-full md:w-72">
          <label className="block text-xs font-medium text-gray-700 mb-1">Dates</label>
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={(dates) => {
                const [start, end] = dates as [Date | null, Date | null];
                setStartDate(start);
                setEndDate(end);
                
                // Only close when both dates are selected
                if (start && end) {
                  setIsDatePickerOpen(false);
                }
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              shouldCloseOnSelect={false}
              open={isDatePickerOpen}
              onClickOutside={() => setIsDatePickerOpen(false)}
              onFocus={() => setIsDatePickerOpen(true)}
              placeholderText="Select check-in and check-out dates"
              className="input w-full text-sm cursor-pointer pr-10"
              dateFormat="EEE dd MMM"
              monthsShown={2}
              showPopperArrow={false}
              popperClassName="date-picker-popper"
              calendarClassName="range-calendar"
              minDate={new Date()}
            />
            {/* Calendar icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {/* Status indicator */}
            {startDate && !endDate && (
              <div className="absolute -bottom-5 left-0 text-xs text-green-600 font-medium">
                ✓ Check-in selected, now pick check-out date
              </div>
            )}
          </div>
        </div>

        {/* Guest Picker - Fixed alignment and layout */}
        <div className="w-full md:w-60 relative" ref={guestPickerRef}>
          <label className="block text-xs font-medium text-gray-700 mb-1">Guests & Rooms</label>
          <button
            type="button"
            onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="input w-full flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-gray-700 text-sm">{guestSummary}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showGuestPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showGuestPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-4 min-w-[280px]">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">Adults</div>
                    <div className="text-xs text-gray-500">Age 13+</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={adults <= 1}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">Children</div>
                    <div className="text-xs text-gray-500">Ages 0-12</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={children <= 0}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">{children}</span>
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
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">Rooms</div>
                    <div className="text-xs text-gray-500">Separate rooms</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={rooms <= 1}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">{rooms}</span>
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
                  className="w-full btn-primary text-sm py-3 mt-4"
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