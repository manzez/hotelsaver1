import { useRouter } from 'next/navigation'

export function useScrollNavigation() {
  const router = useRouter()

  const navigateWithScroll = (url: string) => {
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Small delay to allow scroll to complete before navigation
    setTimeout(() => {
      router.push(url)
    }, 100)
  }

  return { navigateWithScroll }
}