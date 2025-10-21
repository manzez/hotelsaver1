import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const specPath = path.join(process.cwd(), 'openapi.json')
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'))
    
    return NextResponse.json(spec, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'OpenAPI specification not found' },
      { status: 404 }
    )
  }
}