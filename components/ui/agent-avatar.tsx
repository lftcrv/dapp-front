import { UserCircle } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface AgentAvatarProps {
  src?: string
  alt: string
}

export function AgentAvatar({ src, alt }: AgentAvatarProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
        <UserCircle className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative w-12 h-12">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        onError={() => setError(true)}
      />
    </div>
  )
} 