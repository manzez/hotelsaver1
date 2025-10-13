import {NextRequest,NextResponse} from 'next/server'
import {SERVICES} from '@/lib/data'
export async function POST(req:NextRequest){const{city='',query=''}=await req.json();const q=String(query||'').toLowerCase();const list=SERVICES.filter(s=>(!city||s.city===city)&&(!q||s.title.toLowerCase().includes(q)||s.category.toLowerCase().includes(q)));return NextResponse.json({results:list.slice(0,60)})}
