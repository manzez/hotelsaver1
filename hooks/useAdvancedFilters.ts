import { useState, useEffect, useCallback } from 'react'

// Debounced search hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Advanced filtering hook
interface FilterOptions {
  searchTerm: string
  city: string
  status: string
  stars: string
  type: string
  priceRange: [number, number]
  featured: boolean | null
  occupancyRange: [number, number]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface Hotel {
  id: string
  name: string
  city: string
  stars: number
  type: string
  basePriceNGN: number
  status: string
  featured: boolean
  totalRooms: number
  availableRooms: number
  images: string[]
  address?: string
  email?: string
  phone?: string
  description?: string
  amenities?: string[]
  createdAt?: string
  updatedAt?: string
}

export function useAdvancedHotelFilter(hotels: Hotel[], filters: FilterOptions) {
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300)
  
  const filteredAndSortedHotels = useCallback(() => {
    let result = [...hotels]

    // Text search (name, id, address, email)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      result = result.filter(hotel => 
        hotel.name.toLowerCase().includes(searchLower) ||
        hotel.id.toLowerCase().includes(searchLower) ||
        (hotel.address && hotel.address.toLowerCase().includes(searchLower)) ||
        (hotel.email && hotel.email.toLowerCase().includes(searchLower)) ||
        (hotel.description && hotel.description.toLowerCase().includes(searchLower))
      )
    }

    // City filter
    if (filters.city) {
      result = result.filter(hotel => hotel.city === filters.city)
    }

    // Status filter
    if (filters.status) {
      result = result.filter(hotel => hotel.status === filters.status)
    }

    // Stars filter
    if (filters.stars) {
      result = result.filter(hotel => hotel.stars === parseInt(filters.stars))
    }

    // Type filter
    if (filters.type) {
      result = result.filter(hotel => hotel.type === filters.type)
    }

    // Price range filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      result = result.filter(hotel => 
        hotel.basePriceNGN >= filters.priceRange[0] && 
        hotel.basePriceNGN <= filters.priceRange[1]
      )
    }

    // Featured filter
    if (filters.featured !== null) {
      result = result.filter(hotel => hotel.featured === filters.featured)
    }

    // Occupancy rate filter
    if (filters.occupancyRange[0] > 0 || filters.occupancyRange[1] < 100) {
      result = result.filter(hotel => {
        const occupancy = hotel.totalRooms > 0 ? 
          ((hotel.totalRooms - hotel.availableRooms) / hotel.totalRooms) * 100 : 0
        return occupancy >= filters.occupancyRange[0] && occupancy <= filters.occupancyRange[1]
      })
    }

    // Sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'city':
          aValue = a.city
          bValue = b.city
          break
        case 'price':
          aValue = a.basePriceNGN
          bValue = b.basePriceNGN
          break
        case 'stars':
          aValue = a.stars
          bValue = b.stars
          break
        case 'occupancy':
          aValue = a.totalRooms > 0 ? ((a.totalRooms - a.availableRooms) / a.totalRooms) * 100 : 0
          bValue = b.totalRooms > 0 ? ((b.totalRooms - b.availableRooms) / b.totalRooms) * 100 : 0
          break
        case 'created':
          aValue = new Date(a.createdAt || 0)
          bValue = new Date(b.createdAt || 0)
          break
        default:
          return 0
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [hotels, debouncedSearchTerm, filters])

  return filteredAndSortedHotels()
}

// Bulk operations hook
export function useBulkOperations<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
      setIsAllSelected(false)
    } else {
      setSelectedIds(new Set(items.map(item => item.id)))
      setIsAllSelected(true)
    }
  }, [items, isAllSelected])

  const toggleSelectItem = useCallback((id: string) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id)
    } else {
      newSelectedIds.add(id)
    }
    setSelectedIds(newSelectedIds)
    setIsAllSelected(newSelectedIds.size === items.length && items.length > 0)
  }, [selectedIds, items.length])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setIsAllSelected(false)
  }, [])

  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedIds.has(item.id))
  }, [items, selectedIds])

  // Update isAllSelected when items change
  useEffect(() => {
    setIsAllSelected(selectedIds.size === items.length && items.length > 0)
  }, [items.length, selectedIds.size])

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isAllSelected,
    toggleSelectAll,
    toggleSelectItem,
    clearSelection,
    getSelectedItems
  }
}

// Local storage hook for filter preferences
export function useFilterPreferences(key: string, defaultFilters: FilterOptions) {
  const [filters, setFilters] = useState<FilterOptions>(() => {
    if (typeof window === 'undefined') return defaultFilters
    
    try {
      const saved = localStorage.getItem(key)
      return saved ? { ...defaultFilters, ...JSON.parse(saved) } : defaultFilters
    } catch {
      return defaultFilters
    }
  })

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    
    try {
      localStorage.setItem(key, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  }, [filters, key])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  }, [defaultFilters, key])

  return { filters, updateFilters, resetFilters }
}