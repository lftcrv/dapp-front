let navigationStart: number | null = null

export const startTiming = (label: string) => {
  if (process.env.NODE_ENV === 'development') {
    performance.mark(`${label}-start`)
    console.time(`⏱️ ${label}`)
  }
}

export const endTiming = (label: string) => {
  if (process.env.NODE_ENV === 'development') {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    console.timeEnd(`⏱️ ${label}`)
  }
}

export const startRouteTransition = () => {
  if (process.env.NODE_ENV === 'development') {
    navigationStart = performance.now()
    console.log('🚀 Route transition started')
  }
}

export const endRouteTransition = () => {
  if (process.env.NODE_ENV === 'development' && navigationStart) {
    const duration = performance.now() - navigationStart
    console.log(`✨ Route transition completed: ${duration.toFixed(2)}ms`)
    navigationStart = null
  }
}

export const measureNavigation = () => {
  if (process.env.NODE_ENV === 'development') {
    // Get First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcp) {
      console.log(`🎨 First Contentful Paint: ${fcp.startTime.toFixed(2)}ms`)
    }

    // Get page load metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    console.log(`📦 DOM Content Loaded: ${navigation.domContentLoadedEventEnd.toFixed(2)}ms`)
    console.log(`🏁 Load Complete: ${navigation.loadEventEnd.toFixed(2)}ms`)
  }
} 