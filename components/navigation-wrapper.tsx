'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'
import type { FC } from 'react'

const NavigationMenu = dynamic(
  () => import('./navigation-menu').then(mod => {
    const Component = mod.NavigationMenu as FC
    Component.displayName = 'NavigationMenu'
    return Component
  }),
  {
    loading: () => null,
    ssr: false
  }
)

const NavigationWrapper = memo(() => {
  return <NavigationMenu />
})
NavigationWrapper.displayName = 'NavigationWrapper'

export { NavigationWrapper } 