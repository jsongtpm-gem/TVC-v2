import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Props { height?: number; variant?: 'dark' | 'light' }

export default function Logo({ height = 40, variant = 'dark' }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    supabase.from('content').select('value').eq('page', 'settings').eq('section', 'logo_url').single()
      .then(({ data }) => { if (data?.value) setSrc(data.value) })
  }, [])

  const textColor = variant === 'light' ? 'text-ivory-100' : 'text-burgundy-800'

  if (!src || imgError) {
    return (
      <span className={`font-serif font-semibold tracking-wide ${textColor}`} style={{ fontSize: height * 0.45, fontFamily: 'var(--font-playfair)' }}>
        Toronto Vintners Club
      </span>
    )
  }

  return (
    <img src={src} alt="Toronto Vintners Club" height={height} style={{ height, width: 'auto' }}
      onError={() => setImgError(true)} />
  )
}
