'use client'

import { memo, useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const DEFAULT_AVATAR = '/avatars/default-agent.svg'

interface ImageState {
  isLoading: boolean
  hasError: boolean
}

interface LoadingStateProps {
  size: number
  className?: string
}

interface AgentAvatarProps {
  src?: string
  alt?: string
  size?: number
  className?: string
  isLoading?: boolean
  priority?: boolean
  quality?: number
}

const LoadingState = memo(({ size, className }: LoadingStateProps) => (
  <div 
    className={cn("relative rounded-full overflow-hidden bg-white/5", className)}
    style={{ width: size, height: size }}
  >
    <Skeleton className="w-full h-full" />
  </div>
))
LoadingState.displayName = 'LoadingState'

const ImageComponent = memo(({ 
  src, 
  alt, 
  size,
  priority = true,
  quality = 90,
  onLoad,
  onError,
  className 
}: Pick<AgentAvatarProps, 'src' | 'alt' | 'size' | 'priority' | 'quality' | 'className'> & {
  onLoad: () => void
  onError: () => void
}) => (
  <Image
    src={src || DEFAULT_AVATAR}
    alt={alt || 'Agent avatar'}
    width={size}
    height={size}
    quality={quality}
    className={cn(
      "object-cover transition-all duration-200",
      !src ? "opacity-50" : "opacity-100",
      className
    )}
    onError={onError}
    onLoad={onLoad}
    priority={priority}
  />
))
ImageComponent.displayName = 'ImageComponent'

export const AgentAvatar = memo(({
  src,
  alt = 'Agent avatar', 
  className,
  size = 32,
  isLoading,
  priority,
  quality
}: AgentAvatarProps) => {
  const [imageState, setImageState] = useState<ImageState>({
    isLoading: true,
    hasError: false
  })
  
  const handleError = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false
    }))
  }, [])

  const handleLoad = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      isLoading: false
    }))
  }, [])

  if (isLoading) {
    return <LoadingState size={size} className={className} />
  }

  const imageSrc = imageState.hasError || !src ? DEFAULT_AVATAR : src

  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden bg-white/5",
        className
      )}
      style={{ width: size, height: size }}
    >
      {imageState.isLoading && <LoadingState size={size} />}
      <ImageComponent
        src={imageSrc}
        alt={alt}
        size={size}
        priority={priority}
        quality={quality}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          imageState.isLoading ? "scale-110 blur-sm" : "scale-100 blur-0"
        )}
      />
    </div>
  )
})

AgentAvatar.displayName = 'AgentAvatar' 