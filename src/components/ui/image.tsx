import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
}

export function ProductImage({ src, alt }: ProductImageProps) {
  const [hasError, setHasError] = useState(false)

  const isValidSrc = (path: string | null | undefined): path is string => {
    if (!path) return false
    return path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://')
  }

  if (!isValidSrc(src) || hasError) {
    return (
      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
        <ImageIcon className="w-4 h-4 text-slate-600" />
      </div>
    )
  }

  return (
    <div className="relative w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="32px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  )
}