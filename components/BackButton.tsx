'use client'
import { useRouter } from 'next/navigation'

export default function BackButton(){
  const r = useRouter()
  return (
    <button onClick={()=>r.back()} className="btn-ghost text-sm" aria-label="Go back">
      ← Back
    </button>
  )
}
