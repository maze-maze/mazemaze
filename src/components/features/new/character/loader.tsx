'use client'
import { Loader2 } from 'lucide-react'

export default function Loader() {
  return (
    <div className="flex items-center justify-center flex-1 h-64">
      <Loader2 size={40} className="animate-spin text-white" />
    </div>
  )
}
