/* eslint-disable no-console */
'use client'

import type { CarouselApi } from '🎙️/components/ui/carousel'
import { Button } from '🎙️/components/ui/button'
import { Carousel, CarouselContent, CarouselItem } from '🎙️/components/ui/carousel'
import { cn } from '🎙️/lib/utils'
import { MessageSquareMoreIcon, SearchIcon, Share2Icon, ThumbsDownIcon, ThumbsUpIcon, UserIcon, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Background from '../layout/backgeound'
import Header from '../layout/header'
import NavigationBar from '../layout/navigation-bar'

const items = [
  {
    id: 'uma',
    bg: 'bg-gradient-to-b from-purple-500/70 to-pink-300/70 text-white',
    title: '謎の未確認生物 UMA探訪記',
  },
  {
    id: 'gourmet',
    bg: 'bg-gradient-to-b from-blue-600/70 to-blue-200/70 text-white',
    title: '異世界転生グルメ紀行',
  },
  {
    id: 'cafe',
    bg: 'bg-gradient-to-b from-yellow-400/70 to-yellow-200/70 text-white',
    title: '昭和レトロ喫茶の魅力',
  },
  {
    id: 'space',
    bg: 'bg-gradient-to-b from-green-400/70 to-green-200/70 text-white',
    title: '宇宙人と語る夜',
  },
]

export default function ViewPage() {
  const [api, setApi] = useState<CarouselApi>()
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [progress, setProgress] = useState(0)
  // const [duration, setDuration] = useState(0) // duration は現在使われていないためコメントアウトまたは削除検討
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)

  // --- モーダル用 State ---
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [commentModalVisible, setCommentModalVisible] = useState(false)

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareModalVisible, setShareModalVisible] = useState(false)

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchModalVisible, setSearchModalVisible] = useState(false)

  // 汎用モーダルアニメーションハンドラ
  const manageModalVisibility = (
    isOpen: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    open: boolean,
  ) => {
    if (open) {
      setOpen(true)
      const timer = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(timer)
    }
    else {
      setVisible(false)
      const timer = setTimeout(() => setOpen(false), 300) // duration-300 に合わせる
      return () => clearTimeout(timer)
    }
  }

  useEffect(() => {
    return manageModalVisibility(isCommentModalOpen, setCommentModalVisible, setIsCommentModalOpen, isCommentModalOpen)
  }, [isCommentModalOpen])

  useEffect(() => {
    return manageModalVisibility(isShareModalOpen, setShareModalVisible, setIsShareModalOpen, isShareModalOpen)
  }, [isShareModalOpen])

  useEffect(() => {
    return manageModalVisibility(isSearchModalOpen, setSearchModalVisible, setIsSearchModalOpen, isSearchModalOpen)
  }, [isSearchModalOpen])

  // --- モーダル開閉ハンドラ ---
  const openCommentModal = () => setIsCommentModalOpen(true)
  const closeCommentModal = () => setIsCommentModalOpen(false)

  const openShareModal = () => setIsShareModalOpen(true)
  const closeShareModal = () => setIsShareModalOpen(false)

  const openSearchModal = () => setIsSearchModalOpen(true)
  const closeSearchModal = () => setIsSearchModalOpen(false)

  // (音声再生ロジックは変更なしのため省略)
  useEffect(() => {
    if (!api) {
      return
    }
    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap()
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
      const currentItem = items[currentIndex]
      if (currentItem) {
        const audio = new Audio(`/audio/${currentItem.id}.wav`)
        const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100 || 0)
        // const updateDuration = () => setDuration(audio.duration || 0)
        const resetProgress = () => setProgress(0)
        audio.addEventListener('timeupdate', updateProgress)
        // audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', resetProgress)
        audio.play().catch(error => console.log('音声の再生に失敗:', error))
        setCurrentAudio(audio)

        // クリーンアップ関数内でリスナーを削除
        return () => {
          audio.removeEventListener('timeupdate', updateProgress)
          // audio.removeEventListener('loadedmetadata', updateDuration);
          audio.removeEventListener('ended', resetProgress)
        }
      }
    }
    api.on('select', onSelect)
    // 初期再生
    if (items.length > 0 && !currentAudio) {
      const initialItem = items[api.selectedScrollSnap() || 0]
      const audio = new Audio(`/audio/${initialItem.id}.wav`)
      const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100 || 0)
      // const updateDuration = () => setDuration(audio.duration || 0)
      const resetProgress = () => setProgress(0)
      audio.addEventListener('timeupdate', updateProgress)
      // audio.addEventListener('loadedmetadata', updateDuration)
      audio.addEventListener('ended', resetProgress)
      audio.play().catch(error => console.log('初期音声の再生に失敗:', error))
      setCurrentAudio(audio)
    }
    return () => {
      api.off('select', onSelect)
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
        // ここでもリスナー削除が理想 (ただし、onSelect内で生成されたaudioインスタンスへの参照が必要)
      }
    }
  }, [api, currentAudio]) // currentAudio を依存配列に入れると再生/停止でループする可能性があるので注意

  return (
    <div className="relative bg-[#0E0B16] h-screen flex flex-col items-center w-full ">

      <Header Icon={SearchIcon} onIconClick={openSearchModal} />

      <Background />
      <Carousel
        orientation="vertical"
        className="w-full"
        opts={{
          loop: true,
        }}
        setApi={setApi}
      >
        <CarouselContent className="h-screen">
          {Array.from({ length: 4 }).map((_, index) => (

            <CarouselItem key={index} className={cn('h-full w-full flex flex-col items-center gap-20 pt-36 relative')}>
              <div className={cn(items[index].bg, 'text-xl flex font-bold gap-2 p-4 rounded-2xl backdrop-blur-sm text-center')}>

                <Image

                  src="/lama.png"

                  alt=""
                  width={40}
                  height={40}
                />
                <p>{items[index].title}</p>
              </div>

              <div className="flex flex-col items-center justify-center gap-10 rounded-2xl">
                {' '}
                {/* gap調整 */}
                <div className="flex flex-col items-center justify-center rounded-2xl gap-2">
                  <Image
                    src="/lama.png" // パスを確認
                    alt="Lama character"
                    width={140} // サイズ調整
                    height={140}
                  />
                  <p className="font-bold text-white">宇宙から来たラマ</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl gap-2 bg-black/20 backdrop-blur-sm">
                  {' '}
                  {/* 背景調整 */}
                  <Image
                    src="/character.png" // パスを確認
                    alt="Tommy character"
                    width={140} // サイズ調整
                    height={140}
                  />
                  <p className="font-bold text-white">トナカイと暮らしたトミー</p>
                </div>
              </div>

              <div className="absolute right-4 bottom-24 z-10 flex flex-col gap-4">
                {' '}
                {/* right, bottom, z-index調整 */}
                <Button onClick={() => router.push('/111')} size="icon" variant="ghost" className="rounded-full size-12 p-0">
                  {' '}
                  {/* variant, size調整 */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-[#3B82F6]  flex items-center justify-center shadow-lg relative overflow-hidden">
                    {' '}
                    {/* shadow調整 */}
                    {/* グラデーションエフェクト用のdivは削除または調整 */}
                    <UserIcon className="text-white size-6" />
                    {' '}
                    {/* アイコンを直接配置 */}
                  </div>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    'rounded-full size-12 text-white', // size, text色調整
                    liked ? 'bg-green-500/80' : 'bg-black border', // 背景調整
                  )}
                  onClick={() => {
                    setLiked(!liked)
                    if (disliked)
                      setDisliked(false)
                  }}
                >
                  <ThumbsUpIcon className="size-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    'rounded-full size-12 text-white', // size, text色調整
                    disliked ? 'bg-red-500/80' : 'bg-black border', // 背景調整
                  )}
                  onClick={() => {
                    setDisliked(!disliked)
                    if (liked)
                      setLiked(false)
                  }}
                >
                  <ThumbsDownIcon className="size-6" />
                </Button>
                <Button onClick={openCommentModal} size="icon" variant="ghost" className="rounded-full bg-black border text-white size-12">
                  <MessageSquareMoreIcon className="size-6" />
                </Button>
                <Button onClick={openShareModal} size="icon" variant="ghost" className="rounded-full bg-black border text-white size-12">
                  <Share2Icon className="size-6" />
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* 音声プログレスバー */}
      <div className="fixed bottom-0 right-1/2 translate-x-1/2 z-30 w-md">
        <div className="w-full h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ナビゲーションバー */}
      <NavigationBar />

      {/* --- モーダル群 --- */}
      {/* コメントモーダル */}
      {isCommentModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60  z-40 backdrop-blur-sm" onClick={closeCommentModal} />
          <div
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-[#0E0B16] text-white p-5 rounded-t-2xl shadow-2xl z-50 max-h-[70vh] flex flex-col', // max-h, flex-col
              'transition-transform duration-300 ease-out',
              commentModalVisible ? 'translate-y-0' : 'translate-y-full',
            )}
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h2 className="text-lg font-semibold">コメント</h2>
              <button onClick={closeCommentModal} className="p-1 text-white"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto flex-grow">
              {/* コメント内容のプレースホルダー */}
              <p className="py-2 text-gray-300">コメントがここに表示されます...</p>
              <p className="py-2 text-gray-300">ユーザーA: 面白い！</p>
              <p className="py-2 text-gray-300">ユーザーB: なるほどね。</p>
              {/* ...たくさんのコメント */}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <input type="text" placeholder="コメントを追加..." className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
          </div>
        </>
      )}

      {/* シェアモーダル */}
      {isShareModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60  z-40 backdrop-blur-sm" onClick={closeShareModal} />
          <div
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-[#0E0B16] text-white p-5 rounded-t-2xl shadow-2xl z-50',
              'transition-transform duration-300 ease-out',
              shareModalVisible ? 'translate-y-0' : 'translate-y-full',
            )}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">シェアする</h2>
              <button onClick={closeShareModal} className="p-1 text-white"><X size={24} /></button>
            </div>
            {/* シェアオプションのプレースホルダー */}
            <ul className="space-y-2">
              <li><Button variant="outline" className="w-full justify-start p-2 text-white border-gray-700 hover:bg-gray-800">Twitter</Button></li>
              <li><Button variant="outline" className="w-full justify-start p-2 text-white border-gray-700 hover:bg-gray-800">Facebook</Button></li>
              <li><Button variant="outline" className="w-full justify-start p-2 text-white border-gray-700 hover:bg-gray-800">リンクをコピー</Button></li>
            </ul>
            <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
          </div>
        </>
      )}

      {/* 検索・おすすめモーダル */}
      {isSearchModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60  z-40 backdrop-blur-sm" onClick={closeSearchModal} />
          <div
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-[#0E0B16] text-white p-5 rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col', // max-h, flex-col
              'transition-transform duration-300 ease-out',
              searchModalVisible ? 'translate-y-0' : 'translate-y-full',
            )}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">検索</h2>
              <button onClick={closeSearchModal} className="p-1 text-white"><X size={24} /></button>
            </div>
            <input type="search" placeholder="キーワードで検索..." className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400 mb-4 focus:ring-purple-500 focus:border-purple-500" />
            <div className="overflow-y-auto flex-grow">
              <h3 className="text-md font-semibold text-gray-400 mt-2 mb-2">おすすめ</h3>
              {/* おすすめ内容のプレースホルダー */}
              <ul className="space-y-2">
                <li className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">おすすめトピック１</li>
                <li className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">人気のUMA</li>
                <li className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">最新の異世界グルメ</li>
              </ul>
            </div>
            <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
          </div>
        </>
      )}
    </div>
  )
}
