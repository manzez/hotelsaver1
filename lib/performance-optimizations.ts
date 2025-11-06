// lib/performance-optimizations.ts - Performance optimization utilities

// Image URL optimization for different screen sizes
export function optimizeImageUrl(url: string, width: number = 800, quality: number = 80): string {
  // If it's already a Google Maps API photo, add width and quality parameters
  if (url.includes('googleapis.com/maps/api/place/photo')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('maxwidth', Math.min(width, 1600).toString()); // Cap at 1600px
    return urlObj.toString();
  }
  
  // If it's Unsplash, add width and quality parameters
  if (url.includes('unsplash.com')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', quality.toString());
    urlObj.searchParams.set('auto', 'format');
    return urlObj.toString();
  }
  
  return url;
}

// Get responsive image sizes for different breakpoints
export function getResponsiveImageSizes(baseWidth: number = 400) {
  return {
    mobile: Math.round(baseWidth * 0.8),      // 320px
    tablet: Math.round(baseWidth * 1.2),      // 480px  
    desktop: Math.round(baseWidth * 1.5),     // 600px
    large: Math.round(baseWidth * 2)          // 800px
  };
}

// Lazy loading intersection observer configuration
export const lazyLoadingOptions = {
  rootMargin: '50px 0px', // Start loading 50px before image comes into view
  threshold: 0.01
};

// Debounce function for search inputs and filters
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Virtual scrolling configuration for large lists
export const virtualScrollConfig = {
  itemHeight: 300, // Approximate height of hotel cards
  containerHeight: 600, // Height of scrollable container
  buffer: 5 // Number of items to render outside visible area
};

// Performance monitoring utilities
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
}

export async function measureAsyncPerformance<T>(
  name: string, 
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

// Bundle size optimization - dynamic imports for heavy components
export const lazyComponents = {
  SearchFilters: () => import('@/components/SearchFilters'),
  RoomSelection: () => import('@/components/RoomSelection'),
  MobileImageCarousel: () => import('@/components/MobileImageCarousel'),
  DatePicker: () => import('@/components/ClientDatepicker')
};

// Memory usage optimization
export function cleanupImageCache() {
  // Force garbage collection of unused images (browser dependent)
  if ('memory' in performance && 'usedJSHeapSize' in (performance as any).memory) {
    const memInfo = (performance as any).memory;
    console.log(`💾 Memory usage: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
  }
}

// API request optimization
export function optimizeApiRequest(url: string, options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'max-age=300', // 5-minute cache
      ...options.headers
    }
  };
}