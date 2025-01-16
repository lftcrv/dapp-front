'use client'

import dynamic from 'next/dynamic'

const NavigationMenu = dynamic(
  () => import('./navigation-menu').then(mod => mod.NavigationMenu),
  {
    loading: () => null,
    ssr: false
  }
)

export function NavigationWrapper() {
  return <NavigationMenu />
} 