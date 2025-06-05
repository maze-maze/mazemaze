/* eslint-disable no-console */

'use client'

import { signOut } from '🎙️/lib/auth-client'
import { cn } from '🎙️/lib/utils'
import {
  AlignJustifyIcon,
  CreditCard,
  Home,
  LogOut,
  Plus,
  User,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import Background from '../layout/backgeound'
import Header from '../layout/header'
import NavigationBar from '../layout/navigation-bar'

export default function UserPage({ name }: { name: string }) {
  // モックデータ
  const [themes] = useState<string[]>([
    '謎の未確認生物 UMA探訪記',
    '異世界転生グルメ紀行',
    '昭和レトロ喫茶の魅力',
    '宇宙人と語る夜',
    'AIが選ぶ名作映画',
  ])

  // モックデータ - いいね用 (例としていくつかテーマを準備)
  const [likedThemes] = useState<string[]>([
    '昭和レトロ喫茶の魅力',
    'AIが選ぶ名作映画',
    '異世界転生グルメ紀行',
  ])

  // グラデーション配列
  const gradients = [
    'bg-gradient-to-b from-red-500 to-pink-300',
    'bg-gradient-to-b from-blue-600 to-blue-200',
    'bg-gradient-to-b from-yellow-400 to-yellow-200',
    'bg-gradient-to-b from-green-400 to-green-200',
    'bg-gradient-to-b from-purple-400 to-purple-200',
  ]
  const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: 'posts' })
  const displayThemes = activeTab === 'posts' ? themes : likedThemes

  // モーダルの表示状態を管理
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // アニメーション用の状態（マウント後にtrueにしてトランジションを発火させる）
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (isMenuOpen) {
      // モーダルを開くときに少し遅れて visible 状態にし、CSSトランジションをトリガー
      const timer = setTimeout(() => setModalVisible(true), 10) // わずかな遅延
      return () => clearTimeout(timer)
    }
    else {
      setModalVisible(false) // 閉じるときは即座に visible 状態を解除
    }
  }, [isMenuOpen])

  const handleOpenMenu = () => {
    setIsMenuOpen(true)
  }

  const handleCloseMenu = () => {
    // アニメーションのために 먼저 modalVisible을 false로 설정
    setModalVisible(false)
    // CSSトランジションの完了を待ってからisMenuOpenをfalseに
    setTimeout(() => {
      setIsMenuOpen(false)
    }, 300) // duration-300 に合わせる
  }

  // Billingアクションのプレースホルダー
  const handleBilling = () => {
    console.log('Billing clicked')
    handleCloseMenu()
    // 実際のBillingページへの遷移や処理をここに記述
  }

  // パスからusernameを取得してきて

  const pathname = usePathname()
  const pathSegments = pathname.split('/')
  const usernameFromPath = pathSegments[pathSegments.length - 1] // 最後のセグメントを取得

  // 表示するテーマリストをアクティブなタブに応じて決定
  return (
    <div className="relative bg-[#0E0B16] min-h-screen flex flex-col items-center w-full h-full pt-10">

      <Header Icon={AlignJustifyIcon} onIconClick={handleOpenMenu} />

      <Background />

      <div className="mt-10 flex flex-col items-center justify-center z-10">

        {/* グラデーションのかかった円 */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-[#3B82F6] mb-6 flex items-center justify-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute top-2 left-4 w-8 h-4 rounded-full bg-white/30 blur-md"></div>
        </div>

        {/* ユーザー名 */}
        <h1 className="text-white text-2xl font-bold mb-1">{name}</h1>

        {/* ユーザーID */}
        <p className="text-gray-400 text-sm mb-8">
          @
          {usernameFromPath}
        </p>
      </div>

      {/* タブ部分 */}
      <div className="sticky top-15 left-0 right-0 flex justify-center z-20  py-4 w-full">
        <div className="flex bg-gray-800/50 rounded-full p-1">
          <button
            className={cn(
              'px-6 py-2 rounded-full font-medium transition-colors duration-200 ease-in-out',
              activeTab === 'posts'
                ? 'bg-white text-gray-800'
                : 'text-white hover:bg-gray-700/70', // 非アクティブ時のホバー効果を追加
            )}
            onClick={() => setActiveTab('posts')} // nullを許容しない場合
          >
            投稿
          </button>
          <button
            className={cn(
              'px-6 py-2 rounded-full font-medium transition-colors duration-200 ease-in-out',
              activeTab === 'likes'
                ? 'bg-white text-gray-800'
                : 'text-white hover:bg-gray-700/70', // 非アクティブ時のホバー効果を追加
            )}
            onClick={() => setActiveTab('likes')} // nullを許容しない場合
          >
            いいね
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 mt-4 mb-40 w-full">
        {displayThemes.map((themeItem, idx) => (
          <div
            key={`${activeTab}-${idx}`}
            className="flex justify-center"
          >
            <button
              className={cn(
                'p-4 gap-3 rounded-lg flex flex-col items-center justify-center text-center transition w-40 h-52 relative',
                gradients[idx % gradients.length],
              )}

            >
              <span className="text-base font-bold text-white">{themeItem}</span>
              <img src="/lama.png" alt="" className="w-12 h-12" />
            </button>
          </div>
        ))}
        {activeTab === 'likes' && displayThemes.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 py-10">
            いいねしたテーマはありません。
          </div>
        )}
      </div>

      {/* ナビゲーションバー */}
      <NavigationBar/>

      {/* --- ハンバーガーメニュー用モーダル --- */}
      {isMenuOpen && (
        <>

          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 z-30 backdrop-blur-xs" // backdrop-blur-sm を追加
            onClick={handleCloseMenu}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-[#0E0B16] text-white p-5 rounded-t-2xl shadow-2xl z-40',
              'transition-transform duration-300 ease-out', // Tailwindのトランジションクラス
              modalVisible ? 'translate-y-0' : 'translate-y-full', // 表示/非表示のアニメーション
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-modal-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="menu-modal-title" className="text-lg font-semibold text-gray-300">メニュー</h2>
              <button
                onClick={handleCloseMenu}
                className="p-1 text-white"
                aria-label="閉じる"
              >
                <X size={24} />
              </button>
            </div>
            <nav>
              <ul className="space-y-2">
                {' '}
                {/* space-y-2 で項目間の間隔を調整 */}
                <li>
                  <button
                    onClick={handleBilling}
                    className="flex items-center w-full p-3 hover:bg-gray-700 rounded-lg transition-colors duration-150 ease-in-out text-gray-200"
                  >
                    <CreditCard size={20} className="mr-4 text-sky-400" />
                    {' '}
                    {/* アイコンに色付けも可能 */}
                    Billing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => signOut('/user')}
                    className="flex items-center w-full p-3 hover:bg-gray-700 rounded-lg transition-colors duration-150 ease-in-out text-red-400 hover:text-red-300"
                  >
                    <LogOut size={20} className="mr-4" />
                    {' '}
                    {/* ログアウトアイコンの色はボタンのテキスト色に依存させるか、個別に指定 */}
                    ログアウト
                  </button>
                </li>
              </ul>
            </nav>
            {/* セーフエリア対応のための余白 (iOSなど) */}
            <div className="pb-safe-area-inset-bottom"></div>
          </div>
        </>
      )}
      {/* --- モーダルここまで --- */}

    </div>
  )
}
