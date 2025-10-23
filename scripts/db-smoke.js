// Simple production DB smoke test: creates a PaymentIntent row
// Usage:
//   export DATABASE_URL="postgres://user:pass@host:5432/db" && npm run db:smoke

const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const ref = `SMOKE_${Date.now()}`
    const pi = await prisma.paymentIntent.create({
      data: {
        provider: 'paystack',
        amountNGN: 1000,
        currency: 'NGN',
        email: 'smoke@example.com',
        reference: ref,
        status: 'INITIATED',
        context: { note: 'smoke-test' }
      }
    })
    console.log('Created PaymentIntent:', pi.id, pi.reference)

    const fetched = await prisma.paymentIntent.findUnique({ where: { reference: ref } })
    if (!fetched) {
      throw new Error('PaymentIntent not found after creation')
    }
    console.log('Verified PaymentIntent fetch OK')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('DB smoke test failed:', err)
  process.exit(1)
})
