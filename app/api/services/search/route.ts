import { NextRequest, NextResponse } from 'next/server';
import { listServices } from '@/lib/services-source';
import { allowIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Lightweight rate limit: ~10/min per IP+UA to prevent abuse
    const ip = (req.ip || req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    const ua = req.headers.get('user-agent') || 'ua'
    const key = `${ip}|${ua.substring(0, 32)}`
    const rl = allowIp(key, { capacity: 10, refillPerSec: 10 / 60 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'rate-limited', message: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': '10' } }
      )
    }

    const { city = '', query = '' } = await req.json();
    const results = await listServices({ city, query, limit: 60 });
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format', results: [] },
      { status: 400 }
    );
  }
}
