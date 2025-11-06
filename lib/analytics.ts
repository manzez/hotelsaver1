// Lightweight GA4 event helper with consent gating
// Reads ConsentBanner's localStorage flag and sends events only when allowed

type Params = Record<string, any>

function hasConsent(): boolean {
  try {
    const v = (typeof window !== 'undefined') ? localStorage.getItem('hs_ga_consent') : null
    return v === 'granted'
  } catch {
    return false
  }
}

function hasGtag(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function'
}

/**
 * Send a GA4 event if consent is granted and gtag is available.
 * Uses transport 'beacon' to avoid losing events on navigation.
 */
export function track(eventName: string, params: Params = {}): void {
  try {
    if (!hasConsent() || !hasGtag()) return
    ;(window as any).gtag('event', eventName, { ...params, transport_type: 'beacon' })
  } catch {
    // no-op
  }
}

/** Convenience for page view when needed outside Analytics.tsx */
export function pageview(path: string): void {
  try {
    if (!hasConsent() || !hasGtag()) return
    const GA_ID = (process as any).env?.NEXT_PUBLIC_GA_ID
    if (!GA_ID) return
    ;(window as any).gtag('config', GA_ID, { page_path: path })
  } catch {
    // no-op
  }
}
