'use client'

import dynamic from 'next/dynamic'
import { addDays, startOfDay } from 'date-fns'
import { useSearchForm } from '../hooks/useSearchForm'
import { useSearchUI } from '../hooks/useSearchUI'

// Lazy-load the DatePicker to avoid heavy JS on initial paint
const DatePicker = dynamic<any>(() => import('react-datepicker'), { ssr: false })
import "react-datepicker/dist/react-datepicker.css"
import "./datepicker.css"

interface SearchBarProps {
  defaultCity?: string
  defaultHotelQuery?: string
  defaultCheckIn?: string
  defaultCheckOut?: string
  defaultAdults?: number
  defaultChildren?: number
  defaultRooms?: number
  defaultBudget?: string
  defaultStayType?: 'any' | 'hotel' | 'apartment'
  submitLabel?: string
  onBeforeSubmit?: () => void
  showBrandSplashOnSubmit?: boolean
  mobileDatePicker?: 'native' | 'custom'
}

export default function SearchBar({
  submitLabel = 'Search',
  mobileDatePicker = 'native',
  ...formProps
}: SearchBarProps) {
  
  // Separate business logic from UI logic
  const searchForm = useSearchForm(formProps)
  const searchUI = useSearchUI({ mobileDatePicker })

  const {
    formData,
    updateField,
    searchResults,
    handleSearchInput,
    handleSearchSelect,
    getGuestSummary,
    formatDateRange,
    handleSubmit,
    cities,
    budgets
  } = searchForm

  const {
    showGuestPicker,
    isDatePickerOpen,
    showSearchResults,
    isMobile,
    guestPickerRef,
    searchInputRef,
    toggleGuestPicker,
    toggleDatePicker,
    handleSearchFocus,
    getMobileInputClasses,
    getMobileButtonClasses
  } = searchUI

  // Auto-fill dates if missing (business logic, but UI-triggered)
  const handleDatePickerOpen = () => {
    if (!formData.startDate || !formData.endDate) {
      const today = startOfDay(new Date())
      const tomorrow = addDays(today, 1)
      
      if (!formData.startDate) updateField('startDate', today)
      if (!formData.endDate) updateField('endDate', tomorrow)
    }
    toggleDatePicker()
  }

  return (
    <div className="w-full space-y-3 md:space-y-0 md:flex md:items-center md:gap-3 md:bg-white md:border md:border-gray-200 md:rounded-xl md:p-1">
      
      {/* Destination Search */}
      <div className="w-full md:flex-1" ref={searchInputRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
          Where are you going?
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search destinations or hotels..."
            value={formData.hotelQuery}
            onChange={(e) => {
              handleSearchInput(e.target.value)
              if (!showSearchResults) handleSearchFocus()
            }}
            onFocus={handleSearchFocus}
            className={getMobileInputClasses(showSearchResults)}
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-[60] max-h-64 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    handleSearchSelect(result)
                    searchUI.setShowSearchResults(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {result.type === 'city' ? (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-medium text-gray-900">
                        {result.value}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.type === 'city' ? 'City' : `Hotel in ${result.city}`}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Check-in & Check-out */}
      <div className="w-full md:flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
          Check-in & Check-out
        </label>
        <button
          type="button"
          onClick={handleDatePickerOpen}
          className={`${getMobileInputClasses()} flex items-center justify-between text-left`}
        >
          <span>{formatDateRange()}</span>
          <svg className="w-4 h-4 md:w-2 md:h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Date Picker Portal */}
        {isDatePickerOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[70] p-4">
            <DatePicker
              selected={formData.startDate}
              onChange={(dates: [Date | null, Date | null] | null) => {
                const [start, end] = (dates || [null, null]) as [Date | null, Date | null]
                updateField('startDate', start)
                updateField('endDate', end)
              }}
              startDate={formData.startDate}
              endDate={formData.endDate}
              selectsRange
              inline
              monthsShown={1}
              minDate={startOfDay(new Date())}
            />
            <button
              type="button"
              onClick={() => searchUI.setIsDatePickerOpen(false)}
              className="w-full mt-3 bg-brand-green hover:bg-brand-dark text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Guests */}
      <div className="w-full md:flex-1" ref={guestPickerRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
          Guests
        </label>
        <button
          type="button"
          onClick={toggleGuestPicker}
          className={`${getMobileInputClasses()} flex items-center justify-between text-left`}
        >
          <span>{getGuestSummary()}</span>
          <svg className={`w-4 h-4 md:w-2 md:h-2 text-gray-400 transition-transform flex-shrink-0 ${showGuestPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showGuestPicker && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] p-6 min-w-[320px]">
            <div className="space-y-6">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Adults</div>
                  <div className="text-sm text-gray-500">Age 13+</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('adults', Math.max(1, formData.adults - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    disabled={formData.adults <= 1}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-lg text-gray-900">{formData.adults}</span>
                  <button
                    type="button"
                    onClick={() => updateField('adults', formData.adults + 1)}
                    className="w-10 h-10 rounded-full bg-brand-green hover:bg-brand-dark text-white flex items-center justify-center font-semibold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Children</div>
                  <div className="text-sm text-gray-500">Age 0-12</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('children', Math.max(0, formData.children - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    disabled={formData.children <= 0}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-lg text-gray-900">{formData.children}</span>
                  <button
                    type="button"
                    onClick={() => updateField('children', formData.children + 1)}
                    className="w-10 h-10 rounded-full bg-brand-green hover:bg-brand-dark text-white flex items-center justify-center font-semibold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rooms */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Rooms</div>
                  <div className="text-sm text-gray-500">Separate rooms</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('rooms', Math.max(1, formData.rooms - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    disabled={formData.rooms <= 1}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-lg text-gray-900">{formData.rooms}</span>
                  <button
                    type="button"
                    onClick={() => updateField('rooms', formData.rooms + 1)}
                    className="w-10 h-10 rounded-full bg-brand-green hover:bg-brand-dark text-white flex items-center justify-center font-semibold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => searchUI.setShowGuestPicker(false)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Type & Budget - Mobile First */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-1 w-full md:flex-1">
        {/* Property Type */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
            Property Type
          </label>
          <div className="relative">
            <select 
              className={getMobileInputClasses()}
              value={formData.stayType} 
              onChange={e => updateField('stayType', e.target.value as 'any' | 'hotel' | 'apartment')}
              aria-label="Property type"
            >
              <option value="any">Any Type</option>
              <option value="hotel">Hotels</option>
              <option value="apartment">Apartments</option>
            </select>
            <div className="absolute right-3 md:right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 md:w-2 md:h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
            Budget Range
          </label>
          <div className="relative">
            <select 
              className={getMobileInputClasses()}
              value={formData.budgetKey} 
              onChange={e => updateField('budgetKey', e.target.value)}
              aria-label="Budget"
            >
              {budgets.map(b => (
                <option key={b.key} value={b.key}>{b.label}</option>
              ))}
            </select>
            <div className="absolute right-3 md:right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 md:w-2 md:h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search Button - Full width on mobile, compact on desktop */}
      <button 
        type="button"
        onClick={handleSubmit}
        className={getMobileButtonClasses('primary')}
      >
        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {submitLabel}
      </button>
    </div>
  )
}