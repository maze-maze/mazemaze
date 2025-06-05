// src/components/user-page/tab-switcher.tsx
'use client'

import React from 'react'
import { cn } from '🎙️/lib/utils'
import { useQueryState } from 'nuqs'

interface TabSwitcherProps {
  // nothing needed; hooks are internal
}

export default function TabSwitcher(_: TabSwitcherProps) {
  const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: 'posts' })

  return (
    <div className="sticky top-15 left-0 right-0 flex justify-center z-20 rounded-full w-fit bg-[#0E0B16]/80 backdrop-blur-sm">
      <div className="flex bg-gray-800/50 rounded-full p-1">
        <button
          className={cn(
            'px-6 py-2 rounded-full font-medium transition-colors duration-200 ease-in-out',
            activeTab === 'posts'
              ? 'bg-white text-gray-800'
              : 'text-white hover:bg-gray-700/70'
          )}
          onClick={() => setActiveTab('posts')}
        >
          投稿
        </button>
        <button
          className={cn(
            'px-6 py-2 rounded-full font-medium transition-colors duration-200 ease-in-out',
            activeTab === 'likes'
              ? 'bg-white text-gray-800'
              : 'text-white hover:bg-gray-700/70'
          )}
          onClick={() => setActiveTab('likes')}
        >
          いいね
        </button>
      </div>
    </div>
  )
}
