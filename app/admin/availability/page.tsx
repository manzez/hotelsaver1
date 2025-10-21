'use client'
import { useState, useEffect } from 'react'
import BackButton from '@/components/BackButton'

interface AvailabilityData {
  date: Date
  available: number
  total: number
  bookingRate: number
}

export default function AvailabilityManagement() {
  const [selectedService, setSelectedService] = useState('plastic-chair-hire')
  const [calendar, setCalendar] = useState<AvailabilityData[]>([])
  const [loading, setLoading] = useState(false)

  const hireServices = [
    { id: 'canopy-tent-hire', name: 'Canopy Tent Hire', defaultQty: 25 },
    { id: 'plastic-chair-hire', name: 'Plastic Chair Hire', defaultQty: 500 },
    { id: 'sound-system-hire', name: 'Sound System Hire', defaultQty: 15 },
    { id: 'cooler-hire', name: 'Cooler Hire', defaultQty: 30 },
    { id: 'bus-hire', name: 'Bus Hire', defaultQty: 8 },
    { id: 'dj-services', name: 'DJ Services', defaultQty: 12 },
    { id: 'mc-services', name: 'MC Services', defaultQty: 20 },
    { id: 'live-band', name: 'Live Band', defaultQty: 6 }
  ]

  useEffect(() => {
    if (selectedService) {
      fetchAvailabilityCalendar()
    }
  }, [selectedService])

  async function fetchAvailabilityCalendar() {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/services/availability?serviceId=${selectedService}&calendar=true`
      )
      if (response.ok) {
        const data = await response.json()
        setCalendar(data.calendar.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        })))
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error)
    }
    setLoading(false)
  }

  function getAvailabilityStatus(rate: number) {
    if (rate >= 80) return { color: 'bg-red-100 text-red-800', label: 'High Demand' }
    if (rate >= 50) return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Demand' }
    return { color: 'bg-green-100 text-green-800', label: 'Available' }
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    })
  }

  const selectedServiceInfo = hireServices.find(s => s.id === selectedService)

  return (
    <div className="py-8">
      <BackButton />
      
      <div className="flex items-center justify-between mt-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Service Availability Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage equipment availability for hire services
          </p>
        </div>
      </div>

      {/* Service Selection */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {hireServices.map(service => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`p-3 text-left rounded-lg border transition ${
                selectedService === service.id
                  ? 'border-brand-green bg-brand-green/5 text-brand-green'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-gray-500">{service.defaultQty} units total</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Service Overview */}
      {selectedServiceInfo && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{selectedServiceInfo.name}</h2>
            <span className="badge">
              {selectedServiceInfo.defaultQty} Total Units
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {calendar.length > 0 ? Math.round(calendar.reduce((avg, day) => avg + day.available, 0) / calendar.length) : '--'}
              </div>
              <div className="text-sm text-green-800">Avg. Available/Day</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {calendar.length > 0 ? Math.round(calendar.reduce((avg, day) => avg + day.bookingRate, 0) / calendar.length) : '--'}%
              </div>
              <div className="text-sm text-blue-800">Avg. Booking Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {calendar.filter(day => day.bookingRate >= 80).length}
              </div>
              <div className="text-sm text-purple-800">High Demand Days</div>
            </div>
          </div>
        </div>
      )}

      {/* 30-Day Availability Calendar */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">30-Day Availability Calendar</h2>
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-green rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
        </div>

        {calendar.length > 0 ? (
          <div className="space-y-2">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-500 pb-2">
              <div>Date</div>
              <div>Available</div>
              <div>Booked</div>
              <div>Booking Rate</div>
              <div>Status</div>
              <div>Revenue Impact</div>
              <div>Actions</div>
            </div>
            
            {/* Calendar Rows */}
            {calendar.map((day, index) => {
              const status = getAvailabilityStatus(day.bookingRate)
              const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6
              const bookedUnits = day.total - day.available
              
              return (
                <div 
                  key={index}
                  className={`grid grid-cols-7 gap-2 py-3 px-2 rounded-lg border text-sm ${
                    isWeekend ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="font-medium">
                    {formatDate(day.date)}
                    {isWeekend && <span className="text-blue-600 text-xs ml-1">📅</span>}
                  </div>
                  <div className="text-green-600 font-medium">{day.available}</div>
                  <div className="text-red-600">{bookedUnits}</div>
                  <div className="font-medium">
                    {day.bookingRate.toFixed(1)}%
                    <div className={`w-full h-2 bg-gray-200 rounded mt-1`}>
                      <div 
                        className="h-full bg-brand-green rounded"
                        style={{ width: `${Math.min(100, day.bookingRate)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {day.bookingRate >= 80 ? '💰 High' :
                     day.bookingRate >= 50 ? '💵 Med' : '💸 Low'}
                  </div>
                  <div>
                    <button 
                      className="text-xs text-brand-green hover:text-brand-dark"
                      onClick={() => {
                        // In production, this would open edit modal
                        alert(`Edit availability for ${formatDate(day.date)}`)
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : !loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>No availability data found</p>
            <p className="text-sm">Select a service to view its availability calendar</p>
          </div>
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-ghost flex items-center gap-2">
            <span>📊</span> View Analytics
          </button>
          <button className="btn btn-ghost flex items-center gap-2">
            <span>⚙️</span> Bulk Update
          </button>
          <button className="btn btn-ghost flex items-center gap-2">
            <span>📈</span> Demand Forecast
          </button>
        </div>
      </div>
    </div>
  )
}