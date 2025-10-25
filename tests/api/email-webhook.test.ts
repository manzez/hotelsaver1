import { expect } from 'chai'
import axios from 'axios'
import crypto from 'crypto'

const baseURL = process.env.BASE_URL || 'http://localhost:3000'
const adminKey = process.env.ADMIN_API_KEY || 'change-this-admin-key'

function sign(body: string, secret?: string | null) {
  if (!secret) return ''
  const h = crypto.createHmac('sha256', secret)
  h.update(body)
  return 'sha256=' + h.digest('hex')
}

describe('Resend Webhook Verification', () => {
  it('accepts valid signature and returns 204', async () => {
    const body = JSON.stringify({ type: 'email.delivered', data: { id: 'msg_test_1', to: ['user@example.com'], subject: 'Hello' } })
    const signature = sign(body, process.env.RESEND_WEBHOOK_SECRET || 'test_secret')
    // If server not configured, this will still pass in non-production mode
    const res = await axios.post(baseURL + '/api/webhooks/resend', body, {
      headers: { 'content-type': 'application/json', 'resend-signature': signature },
      validateStatus: () => true,
    })
    expect([204, 200, 202]).to.include(res.status)
  })

  it('rejects invalid signature in production', async function () {
    if (process.env.NODE_ENV !== 'production') this.skip()
    const body = JSON.stringify({ type: 'email.bounced', data: { id: 'msg_test_2' } })
    const res = await axios.post(baseURL + '/api/webhooks/resend', body, {
      headers: { 'content-type': 'application/json', 'resend-signature': 'sha256=deadbeef' },
      validateStatus: () => true,
    })
    expect(res.status).to.equal(401)
  })
})

describe('Admin Email Events Summary', () => {
  it('requires admin key', async () => {
    const res = await axios.get(baseURL + '/api/admin/email-events/summary', { validateStatus: () => true })
    expect(res.status).to.equal(401)
  })

  it('returns ok summary with admin key', async () => {
    const res = await axios.get(baseURL + '/api/admin/email-events/summary', {
      headers: { 'x-admin-key': adminKey },
      validateStatus: () => true,
    })
    expect(res.status).to.equal(200)
    expect(res.data).to.have.property('ok', true)
    expect(res.data).to.have.property('summary')
    expect(res.data.summary).to.have.all.keys('windowHours','total','delivered','bounced','complained','opened','clicked','bounceRate')
  })
})
