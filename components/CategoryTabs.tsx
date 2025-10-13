
import Link from 'next/link'

export default function CategoryTabs({active='hotels'}:{active?:'hotels'|'services'}){
  return (
    <div className="tabs">
      <Link href="/" className={`tab ${active==='hotels'?'tab-active':''}`}>Hotels</Link>
      <Link href="/services" className={`tab ${active==='services'?'tab-active':''}`}>Services</Link>
    </div>
  )
}
