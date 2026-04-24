'use client'

import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const { user } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.type === 'OWNER') {
        router.push('/owner/select-store')
      } else if (user.storeId) {
        router.push(`/stores/${user.storeId}/dashboard`)
      }
    } else {
      router.push('/auth/signin')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="mt-4 text-muted-foreground animate-pulse">
        Carregando ambiente...
      </p>
    </div>
  )
}