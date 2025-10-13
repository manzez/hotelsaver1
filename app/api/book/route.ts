import {NextRequest,NextResponse} from 'next/server'
export async function POST(req:NextRequest){const payload=await req.json();return NextResponse.json({bookingId:'BK'+Date.now(),status:'confirmed'})}
