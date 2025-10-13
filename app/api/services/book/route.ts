import {NextRequest,NextResponse} from 'next/server'
export async function POST(req:NextRequest){const data=req.headers.get('content-type')?.includes('application/json')?await req.json():Object.fromEntries((await req.formData()).entries());return NextResponse.json({status:'confirmed',reference:'SV'+Date.now(),data})}
