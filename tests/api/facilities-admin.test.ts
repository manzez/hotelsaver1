import axios from 'axios'
import { expect } from 'chai'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const API_TIMEOUT = 10000

const http = axios.create({ baseURL: BASE_URL, timeout: API_TIMEOUT })

function findHotelAdminFromEnv(): { hotelId: string, hotelKey: string } | null {
  const entries = Object.entries(process.env).filter(([k]) => k.startsWith('HOTEL_ADMIN_KEY_'))
  if (!entries.length) return null
  // Pick the first one
  const [envName, key] = entries[0]
  const suffix = envName.replace('HOTEL_ADMIN_KEY_', '')
  const hotelId = suffix.toLowerCase().replace(/_/g, '-')
  return { hotelId, hotelKey: String(key || '') }
}

describe('Admin Facilities API', () => {
  it('should reject unauthorized access', async () => {
    const res = await http.get('/api/admin/hotels/facilities', { validateStatus: () => true })
    expect(res.status).to.equal(401)
  })

  describe('Company admin mode (if ADMIN_API_KEY set)', () => {
    const adminKey = process.env.ADMIN_API_KEY
    if (!adminKey) {
      it('skipped because ADMIN_API_KEY not set', function () {
        this.skip()
      })
      return
    }

    it('can list overrides and groups', async () => {
      const res = await http.get('/api/admin/hotels/facilities', {
        headers: { 'x-admin-key': adminKey }
      })
      expect(res.status).to.equal(200)
      expect(res.data.ok).to.equal(true)
      expect(res.data).to.have.property('catalog')
      expect(res.data).to.have.property('groups')
    })

    it('can upsert facilities for a specific hotelId', async () => {
      const testHotelId = 'test-hotel-admin'
      const up = await http.put('/api/admin/hotels/facilities', {
        hotelId: testHotelId,
        facilities: ['wifi', 'car_park']
      }, {
        headers: { 'x-admin-key': adminKey }
      })
      expect(up.status).to.equal(200)
      expect(up.data.ok).to.equal(true)
      expect(up.data.hotelId).to.equal(testHotelId)
      expect(up.data.facilities).to.include.members(['wifi', 'car_park'])

      const check = await http.get(`/api/admin/hotels/facilities?hotelId=${encodeURIComponent(testHotelId)}`, {
        headers: { 'x-admin-key': adminKey }
      })
      expect(check.status).to.equal(200)
      expect(check.data.ok).to.equal(true)
      expect(check.data.hotelId).to.equal(testHotelId)
      expect(check.data.facilities).to.include.members(['wifi', 'car_park'])
    })
  })

  describe('Hotel admin mode (if HOTEL_ADMIN_KEY_* set on server)', () => {
    const cred = findHotelAdminFromEnv()
    if (!cred) {
      it('skipped because HOTEL_ADMIN_KEY_* not set', function () {
        this.skip()
      })
      return
    }

    it('can read and write only its own facilities', async () => {
      const { hotelId, hotelKey } = cred
      const headers = { 'x-hotel-id': hotelId, 'x-hotel-key': hotelKey }
      const get1 = await http.get(`/api/admin/hotels/facilities?hotelId=${hotelId}`, { headers })
      expect(get1.status).to.equal(200)
      expect(get1.data.ok).to.equal(true)
      expect(get1.data.hotelId).to.equal(hotelId)

      const put = await http.put('/api/admin/hotels/facilities', {
        hotelId,
        facilities: ['wifi', 'bar']
      }, { headers })
      expect(put.status).to.equal(200)
      expect(put.data.hotelId).to.equal(hotelId)

      const get2 = await http.get(`/api/admin/hotels/facilities?hotelId=${hotelId}`, { headers })
      expect(get2.status).to.equal(200)
      expect(get2.data.facilities).to.include.members(['wifi', 'bar'])
    })
  })
})
