// src/components/user-page/profile-info.tsx
'use client'

import React from 'react'

interface ProfileInfoProps {
  displayName: string
  username: string
}

export default function ProfileInfo({ displayName, username }: ProfileInfoProps) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center z-10">
      {/* グラデーションのかかった円 */}
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-[#3B82F6] mb-6 flex items-center justify-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-2 left-4 w-8 h-4 rounded-full bg-white/30 blur-md" />
      </div>
      <h1 className="text-white text-2xl font-bold mb-1">{displayName}</h1>
      <p className="text-gray-400 text-sm mb-8">
        @
        {username}
      </p>
    </div>
  )
}
