'use client'
import { authClient } from '🎙️/lib/auth-client'
import { StorageKeys } from '🎙️/lib/storage-keys'
import { Home, Plus, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NavigationBar() {
  const [session, setSession] = useState<any>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    (async () => {
      const { data: sessionData, error } = await authClient.getSession()
      if (!sessionData?.user?.id || error) {
        setIsLoading(false)
        return
      }
      setSession(sessionData)
      const res = await fetch('/api/me/username', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-store' },
      })
      if (res.ok) {
        const json = await res.json()
        setUsername(json.username || null)
      }
      setIsLoading(false)
    })()
  }, [])

  const navigate = (route: 'user' | '/new') => {
    if (isLoading)
      return
    if (!session?.user?.id) {
      router.push('/login')
      return
    }
    if (route === 'user') {
      router.push(username ? `/${username}` : '/enter/callback/welcome')
    }
    else {
      router.push(route)
    }
  }

  useEffect(() => {
    if (username) {
      // sessionStorageに値を保存
      sessionStorage.setItem(StorageKeys.USERNAME, username)
    }
  }, [username, router])

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[64px] flex items-center justify-between px-8
                 bg-gradient-to-br from-[#5B5B5B] to-[#23232A] rounded-full shadow-2xl z-20"
      style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}
    >
      <button onClick={() => !isLoading && router.push('/')} disabled={isLoading}>
        <Home className="text-white" size={28} />
      </button>

      <button onClick={() => navigate('/new')} disabled={isLoading}>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
                      bg-gradient-to-b from-[#BFBFBF] to-[#888888] shadow-lg`}
        >
          <Plus className="text-white" size={38} />
        </div>
      </button>

      <button onClick={() => navigate('user')} disabled={isLoading}>
        <User className="text-white" size={28} />
      </button>
    </div>
  )
}
