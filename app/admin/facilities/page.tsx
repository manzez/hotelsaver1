"use client";
import { useEffect, useMemo, useState } from 'react'

type HotelRow = {
  id: string
  name: string
  city: string
  stars?: number
  type?: string
}

type CatalogItem = { key: string; label: string; icon?: string }
type Group = { id: string; label: string; items: { key: string; label: string }[] }

export default function AdminFacilitiesPage() {
  const [hotels, setHotels] = useState<HotelRow[]>([])
  const [selectedHotel, setSelectedHotel] = useState<string>('')
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key'

  // Fetch hotels list
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/hotels', {
          headers: { 'x-admin-key': adminKey }
        })
        if (!res.ok) throw new Error('Failed to fetch hotels')
        const data = await res.json()
        const list: HotelRow[] = Array.isArray(data?.results) ? data.results : []
        setHotels(list)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load hotels')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [adminKey])

  // Fetch facilities catalog and optionally current selection when hotel changes
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const qs = selectedHotel ? `?hotelId=${encodeURIComponent(selectedHotel)}` : ''
        const res = await fetch(`/api/admin/hotels/facilities${qs}`, {
          headers: { 'x-admin-key': adminKey }
        })
        if (!res.ok) throw new Error('Failed to load facilities')
        const data = await res.json()
        const cat: CatalogItem[] = Array.isArray(data?.catalog) ? data.catalog : []
        const grps: Group[] = Array.isArray(data?.groups) ? data.groups : []
        setCatalog(cat)
        setGroups(grps)
        if (selectedHotel) {
          setSelectedKeys(Array.isArray(data?.facilities) ? data.facilities : [])
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load facilities')
      }
    }
    loadFacilities()
  }, [selectedHotel, adminKey])

  const sortedHotels = useMemo(() => {
    return [...hotels].sort((a, b) => a.name.localeCompare(b.name))
  }, [hotels])

  const toggleKey = (k: string) => {
    setSelectedKeys((prev) => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  const save = async () => {
    if (!selectedHotel) return
    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/admin/hotels/facilities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ hotelId: selectedHotel, facilities: selectedKeys })
      })
      if (!res.ok) throw new Error('Save failed')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center py-20">Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="card p-6 text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin · Facilities</h1>
        <button className="btn btn-primary" onClick={save} disabled={!selectedHotel || saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="card p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600">Select hotel</label>
            <select className="select w-full" value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)}>
              <option value="">— choose —</option>
              {sortedHotels.map(h => (
                <option key={h.id} value={h.id}>{h.name} · {h.city}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 text-sm text-gray-600">
            Both company admin and hotel admin can update these facilities.
          </div>
        </div>
      </div>

      <div className="card p-4">
        {!selectedHotel ? (
          <div className="text-gray-600">Pick a hotel to edit its facilities.</div>
        ) : (
          <div className="space-y-6">
            {groups.length ? groups.map(group => (
              <div key={group.id}>
                <h3 className="font-semibold mb-2">{group.label}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.items.map(item => (
                    <label key={item.key} className={`flex items-center gap-2 p-2 rounded border ${selectedKeys.includes(item.key) ? 'border-brand-green bg-emerald-50' : 'border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(item.key)}
                        onChange={() => toggleKey(item.key)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {catalog.map(item => (
                  <label key={item.key} className={`flex items-center gap-2 p-2 rounded border ${selectedKeys.includes(item.key) ? 'border-brand-green bg-emerald-50' : 'border-gray-200'}`}>
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(item.key)}
                      onChange={() => toggleKey(item.key)}
                    />
                    <span className="w-5 text-center">{item.icon || '•'}</span>
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
