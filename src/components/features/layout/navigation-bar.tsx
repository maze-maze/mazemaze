'use client'
import { Home, Plus, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NavigationBar() {

  const router = useRouter()

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[64px] flex items-center justify-between px-8 bg-gradient-to-br from-[#5B5B5B] to-[#23232A] rounded-full shadow-2xl z-20"
      style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}
    >
      <button onClick={() =>  router.push('/')} >
        <Home className="text-white" size={28} />
      </button>

      <button onClick={() => router.push('/new')} >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
                      bg-gradient-to-b from-[#BFBFBF] to-[#888888] shadow-lg`}
        >
          <Plus className="text-white" size={38} />
        </div>
      </button>

      <button onClick={() => router.push('/user')} >
        <User className="text-white" size={28} />
      </button>
    </div>
  )
}
