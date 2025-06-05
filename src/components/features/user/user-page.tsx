// src/components/user-page/user-page.tsx
/* eslint-disable no-console */
'use client'

import React, { useState, useEffect } from 'react'
import Background from '../layout/backgeound'
import NavigationBar from '../layout/navigation-bar'
import { usePathname } from 'next/navigation'
import { useQueryState } from 'nuqs'

import ProfileInfo from './profile-info'
import TabSwitcher from './tab-switcher'
import ThemeGrid from './theme-grid'
import MenuModal from './menu-modal'
import Header from '../layout/header'
import { AlignJustify } from 'lucide-react'

export default function UserPage({ name }: { name: string }) {
  // モックデータ
  const [themes] = useState<string[]>([
    '謎の未確認生物 UMA探訪記',
    '異世界転生グルメ紀行',
    '昭和レトロ喫茶の魅力',
    '宇宙人と語る夜',
    'AIが選ぶ名作映画',
  ])
  const [likedThemes] = useState<string[]>([
    '昭和レトロ喫茶の魅力',
    'AIが選ぶ名作映画',
    '異世界転生グルメ紀行',
  ])
  const gradients = [
    'bg-gradient-to-b from-red-500 to-pink-300',
    'bg-gradient-to-b from-blue-600 to-blue-200',
    'bg-gradient-to-b from-yellow-400 to-yellow-200',
    'bg-gradient-to-b from-green-400 to-green-200',
    'bg-gradient-to-b from-purple-400 to-purple-200',
  ]

  const [activeTab] = useQueryState('tab', { defaultValue: 'posts' })
  const displayThemes = activeTab === 'posts' ? themes : likedThemes

  // モーダル状態
  const [menuOpen, setMenuOpen] = useState(false)

  const handleBilling = () => {
    console.log('Billing clicked')
    setMenuOpen(false)
  }

  const handleOpenMenu = () => setMenuOpen(true)
  const handleCloseMenu = () => setMenuOpen(false)

  const pathname = usePathname()
  const segments = pathname.split('/')
  const usernameFromPath = segments[segments.length - 1]

  return (
    <div className="relative bg-[#0E0B16] min-h-screen flex flex-col items-center w-full h-full pt-10">
      <Header Icon={AlignJustify} onIconClick={handleOpenMenu} />
      <Background />

      <ProfileInfo displayName={name} username={usernameFromPath} />
      <TabSwitcher />

      <div className="grid grid-cols-2 gap-4 px-6 mt-4 mb-40 w-full z-10">
        <ThemeGrid displayThemes={displayThemes} gradients={gradients} />
      </div>

      <NavigationBar />

      <MenuModal isOpen={menuOpen} onClose={handleCloseMenu} onBilling={handleBilling} />
    </div>
  )
}
