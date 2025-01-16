import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Default avatar if image fails to load
const DEFAULT_AVATAR = '/avatars/default-agent.svg'

interface AgentAvatarProps {
  src?: string
  alt: string
  className?: string
}

export function AgentAvatar({ src, alt, className }: AgentAvatarProps) {
  const [error, setError] = useState(false)
  const imageSrc = error || !src ? DEFAULT_AVATAR : src
  
  return (
    <div className={cn("relative w-8 h-8 rounded-full overflow-hidden bg-white/5", className)}>
      <Image
        src={imageSrc}
        alt={alt}
        width={32}
        height={32}
        className={cn(
          "object-cover transition-opacity",
          error ? "opacity-50" : "opacity-100"
        )}
        onError={() => setError(true)}
        priority // Add priority to load early
      />
    </div>
  )
} 