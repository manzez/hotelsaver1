'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type FacilityItem = { key: string; label: string; icon?: string }
type FacilityGroup = { id: string; label: string; items: FacilityItem[] }

export default function HotelPortalPage() {
  const [hotelIdInput, setHotelIdInput] = useState('')
  const [hotelKeyInput, setHotelKeyInput] = useState('')
  const [authedHotelId, setAuthedHotelId] = useState<string>('')
  const [catalog, setCatalog] = useState<FacilityItem[]>([])
  const [groups, setGroups] = useState<FacilityGroup[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const selectedList = useMemo(() => Array.from(selected), [selected])
  const iconMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of catalog) if (c.icon) m.set(c.key, c.icon)
    return m
  }, [catalog])

  // Helpers
  const withHeaders = useCallback(() => {
    const headers = new Headers()
    if (hotelIdInput) headers.set('x-hotel-id', hotelIdInput.trim())
    if (hotelKeyInput) headers.set('x-hotel-key', hotelKeyInput.trim())
    return headers
  }, [hotelIdInput, hotelKeyInput])

  const loadFacilities = useCallback(async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const sp = new URLSearchParams()
      if (hotelIdInput) sp.set('hotelId', hotelIdInput.trim())
      const res = await fetch(`/api/admin/hotels/facilities?${sp.toString()}`, {
        method: 'GET',
        headers: withHeaders(),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Load failed (${res.status}): ${txt}`)
      }
      const data = await res.json()
      // data: { ok, hotelId, facilities, catalog, groups } in hotel-mode
      const hotelId = (data.hotelId || '').toString()
      setAuthedHotelId(hotelId)
      const cat: FacilityItem[] = Array.isArray(data.catalog) ? data.catalog : []
      const grps: FacilityGroup[] = Array.isArray(data.groups) ? data.groups : []
      setCatalog(cat)
      setGroups(grps)
      const sel = new Set<string>((data.facilities || []) as string[])
      setSelected(sel)
      if (!hotelId) {
        setError('No hotelId returned. Check your Hotel ID and Key.')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load facilities')
    } finally {
      setLoading(false)
    }
  }, [hotelIdInput, withHeaders])

  const toggleKey = useCallback((k: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }, [])

  const saveFacilities = useCallback(async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        hotelId: authedHotelId || hotelIdInput.trim(),
        facilities: selectedList,
      }
      const res = await fetch('/api/admin/hotels/facilities', {
        method: 'PUT',
        headers: new Headers({
          'content-type': 'application/json',
          'x-hotel-id': (hotelIdInput || authedHotelId).trim(),
          'x-hotel-key': hotelKeyInput.trim(),
        }),
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Save failed (${res.status}): ${txt}`)
      }
      setSuccess('Facilities saved successfully')
    } catch (e: any) {
      setError(e?.message || 'Failed to save facilities')
    } finally {
      setSaving(false)
    }
  }, [authedHotelId, hotelIdInput, hotelKeyInput, selectedList])

  // If hotelId and key provided via URL (optional convenience)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const hid = sp.get('hotelId') || ''
    const hkey = sp.get('hotelKey') || ''
    if (hid) setHotelIdInput(hid)
    if (hkey) setHotelKeyInput(hkey)
  }, [])

  const renderGroups = () => {
    if (!groups.length) return null
    return (
      <div className="space-y-6">
        {groups.map(group => (
          <div key={group.id} className="card p-4">
            <div className="mb-3 font-semibold">{group.label}</div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
              {group.items.map(item => (
                <label key={item.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selected.has(item.key)}
                    onChange={() => toggleKey(item.key)}
                  />
                  <span className="inline-flex items-center gap-1">
                    {iconMap.get(item.key) ? <span aria-hidden>{iconMap.get(item.key)}</span> : null}
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Hotel Admin Portal</h1>
        <p className="text-sm text-gray-600">Manage facilities for your hotel only. Enter your Hotel ID and Hotel Key to continue.</p>
      </div>

      <div className="card p-4 mb-5">
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Hotel ID</label>
            <input
              className="input"
              data-testid="hotel-id-input"
              placeholder="e.g. HTL_12345"
              value={hotelIdInput}
              onChange={e => setHotelIdInput(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hotel Key</label>
            <input
              className="input"
              type="password"
              data-testid="hotel-key-input"
              placeholder="Your secret key"
              value={hotelKeyInput}
              onChange={e => setHotelKeyInput(e.target.value)}
            />
          </div>
          <div className="btn-wrap">
            <button
              className="btn-primary w-full"
              data-testid="load-facilities"
              onClick={loadFacilities}
              disabled={loading || !hotelIdInput || !hotelKeyInput}
            >
              {loading ? 'Loading…' : 'Load Facilities'}
            </button>
          </div>
        </div>
        {authedHotelId ? (
          <div className="mt-2 text-xs text-gray-600">Authenticated hotel: <span className="font-medium">{authedHotelId}</span></div>
        ) : null}
        {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
        {success ? <div className="mt-2 text-sm text-green-700">{success}</div> : null}
      </div>

      {groups.length > 0 ? (
        <>
          {renderGroups()}
          <div className="mt-6 btn-wrap">
            <button
              className="btn-primary"
              data-testid="save-facilities"
              onClick={saveFacilities}
              disabled={saving || !authedHotelId}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-600">Load facilities to view and edit available options.</div>
      )}
    </div>
  )
}
