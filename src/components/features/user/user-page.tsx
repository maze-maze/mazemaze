/* eslint-disable no-console */
'use client'

import { AlignJustify } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useEffect, useState } from 'react'

import Background from '../layout/backgeound'
import Header from '../layout/header'
import NavigationBar from '../layout/navigation-bar'
// ★★★ 隣のactions.tsからサーバー関数をインポート ★★★
import { getEpisodesByUsername, getUserProfile } from './actions'
import MenuModal from './menu-modal'
import ProfileInfo from './profile-info'
import TabSwitcher from './tab-switcher'
import ThemeGrid from './theme-grid'

// ★★★ サーバー関数から型を定義 ★★★
type Episode = Awaited<ReturnType<typeof getEpisodesByUsername>>[number]

export default function UserPage() {
  // --- パスからユーザー名を取得 ---
  const pathname = usePathname()
  const segments = pathname.split('/')
  const usernameFromPath = segments[segments.length - 1]

  // --- State定義 ---
  const [displayName, setDisplayName] = useState('')
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [likedThemes, setLikedThemes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab] = useQueryState('tab', { defaultValue: 'posts' })
  const displayThemes = activeTab === 'posts' ? episodes : likedThemes

  // モーダル状態
  const [menuOpen, setMenuOpen] = useState(false)

  // --- データ取得処理 ---
  useEffect(() => {
    if (!usernameFromPath)
      return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // ★★★ ここのデータ取得処理を正しく記述 ★★★
        const [fetchedEpisodes, userProfile] = await Promise.all([
          getEpisodesByUsername(usernameFromPath),
          getUserProfile(usernameFromPath),
        ])

        // 取得したデータをStateにセット
        setEpisodes(fetchedEpisodes)
        setDisplayName(userProfile?.name ?? usernameFromPath)
      }
      catch (error) {
        console.error('Failed to fetch user data:', error)
        setDisplayName('ユーザーが見つかりません')
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [usernameFromPath])

  const handleBilling = () => {
    console.log('Billing clicked')
    setMenuOpen(false)
  }
  const handleOpenMenu = () => setMenuOpen(true)
  const handleCloseMenu = () => setMenuOpen(false)

  return (
    <div className="relative bg-[#0E0B16] min-h-screen flex flex-col items-center w-full h-full pt-10">
      <Header Icon={AlignJustify} onIconClick={handleOpenMenu} />
      <Background />

      <ProfileInfo displayName={displayName} username={usernameFromPath} />
      <TabSwitcher />

      <div className="grid grid-cols-2 gap-4 px-6 mt-4 mb-40 w-full z-10">
        {isLoading
          ? (
              <p className="text-white col-span-2 text-center">読み込み中...</p>
            )
          : (
              <ThemeGrid displayThemes={displayThemes} />
            )}
      </div>

      <NavigationBar />

      <MenuModal isOpen={menuOpen} onClose={handleCloseMenu} onBilling={handleBilling} />
    </div>
  )
}
