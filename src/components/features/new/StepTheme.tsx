'use client'
import { Input } from '🎙️/components/ui/input'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Home,
  Plus,
  Search,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function ThemeSelector({
  onSelect,
  onNext,
}: {
  onSelect: (theme: { theme: string, gradient: string }) => void
  onNext: () => void
}) {
  // Embla Carousel用
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(1)

  // モックデータ
  const [themes] = useState<string[]>([
    '謎の未確認生物 UMA探訪記',
    '異世界転生グルメ紀行',
    '昭和レトロ喫茶の魅力',
    '宇宙人と語る夜',
    'AIが選ぶ名作映画',
  ])
  const [selected, setSelected] = useState<string | null>(themes[1])

  // グラデーション配列
  const gradients = [
    'bg-gradient-to-b from-red-500 to-pink-300',
    'bg-gradient-to-b from-blue-600 to-blue-200',
    'bg-gradient-to-b from-yellow-400 to-yellow-200',
    'bg-gradient-to-b from-green-400 to-green-200',
  ]

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionGradient, setTransitionGradient] = useState<string | null>(null)
  const transitionRef = useRef<HTMLDivElement>(null)

  // Emblaのスライド変更時にインデックスを更新
  const onSelectCallback = useCallback(() => {
    if (!emblaApi)
      return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi)
      return
    emblaApi.on('select', onSelectCallback)
    onSelectCallback()
    emblaApi.scrollTo(1)
    return () => {
      emblaApi.off('select', onSelectCallback)
    }
  }, [emblaApi, onSelectCallback])

  // カードを押したとき
  const handleSelect = (theme: string, idx?: number) => {
    setSelected(theme)
    // カードごとのグラデーション
    const gradient = idx === 0 ? 'bg-gradient-to-b from-black to-gray-800' : gradients[(idx! - 1) % gradients.length]
    setTransitionGradient(gradient)
    setIsTransitioning(true)
    document.body.style.overflow = 'hidden'
    setTimeout(() => {
      setIsTransitioning(false)
      setTransitionGradient(null)
      document.body.style.overflow = ''
      onSelect({ theme, gradient })
      onNext()
    }, 600)
  }

  return (
    <div className="relative bg-[#0E0B16] overflow-hidden min-h-screen flex flex-col items-center w-full h-full">
      {/* フルスクリーン遷移アニメーション */}
      {isTransitioning && transitionGradient && (
        <div
          ref={transitionRef}
          className={`fixed inset-0 z-50 flex items-center justify-center transition-transform duration-500 ${transitionGradient}`}
          style={{
            animation: 'expandCard 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
          }}
        />
      )}
      {/* 通常UIは遷移中は非表示 */}
      {!isTransitioning && (
        <>
          {/* ヘッダー部分 - 次へボタンを右上に配置 */}
          <div className="w-full py-5 flex items-center justify-center">
            <svg width="140" height="27" viewBox="0 0 140 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.82413 0.295998H4.00413C6.56013 0.727999 8.00013 2.708 8.82812 5.192C10.2321 4.148 11.7801 3.464 13.4721 3.464C17.2161 3.464 18.6921 6.632 19.0161 7.856C20.6361 5.876 22.7961 4.112 25.1721 4.112C26.4681 4.112 27.6201 4.544 28.5201 5.48C30.3201 7.352 30.7521 10.304 30.7521 12.932C30.7521 17.72 29.3481 23.084 27.4401 25.856C27.2961 26.072 27.0081 26.18 26.7561 26.18C26.3241 26.18 26.0001 25.856 26.0001 25.388C26.0001 25.208 26.0361 25.064 26.1081 24.92C27.8361 22.472 29.1321 17.396 29.1321 12.932C29.1321 9.692 28.3041 5.588 25.1001 5.588C22.5441 5.588 20.1321 8.936 19.5921 9.692C19.9521 10.844 20.1681 12.536 20.1681 14.372C20.1681 20.096 18.4761 26.36 15.2361 26.36C14.6601 26.36 14.1561 26.144 13.7601 25.82C13.1841 25.208 12.8961 24.2 12.8961 22.652C12.8961 18.98 14.9481 13.256 17.8641 9.368C17.5761 8.072 17.0361 7.028 16.2801 6.2C15.5241 5.444 14.5521 4.976 13.3641 4.976C11.9241 4.976 10.5201 5.696 9.26013 6.884C9.69213 8.72 9.83613 11.168 9.83613 13.256C9.83613 20.06 7.53213 26.504 3.82413 26.504C1.98813 26.504 0.548125 24.956 0.548125 21.824C0.548125 17.432 3.39213 10.052 7.49613 6.38C6.77613 3.68 5.51613 2.204 3.68013 1.844C3.32013 1.772 2.99613 1.484 2.99613 1.088C2.99613 0.619998 3.39213 0.295998 3.82413 0.295998ZM8.21613 13.256C8.21613 11.24 8.07213 9.548 7.89213 8C4.61613 11.816 2.13213 17.828 2.13213 21.824C2.13213 22.292 2.16813 25.028 3.86013 25.028C6.20013 25.028 8.21613 19.448 8.21613 13.256ZM18.5481 14.732C18.5481 13.544 18.5121 12.464 18.3321 11.276C16.0281 15.164 14.4801 19.7 14.4801 22.652C14.4801 23.156 14.5521 24.92 15.2721 24.92C16.7841 24.92 18.4761 20.456 18.5481 14.732ZM39.4557 13.544C41.5077 13.544 42.7677 14.876 42.7677 17.36C42.7677 18.728 42.5517 20.312 42.2997 21.68C42.1557 22.616 41.9397 23.84 41.9397 24.56C41.9397 24.776 41.9757 24.92 42.0117 25.028C42.0837 25.172 42.1557 25.28 42.1557 25.46C42.1557 25.856 41.7597 26.216 41.3277 26.216C40.5357 26.216 40.3197 25.208 40.3197 24.488C40.3197 23.732 40.5357 22.724 40.7157 21.428C40.9317 20.096 41.1837 18.692 41.1837 17.432C41.1837 15.704 40.2477 15.056 39.3117 15.056C36.5757 15.056 34.5237 19.232 34.5237 22.508C34.5237 23.84 35.1357 24.776 36.0717 24.776C37.0437 24.776 37.7637 23.912 38.1237 22.94C38.2317 22.652 38.5197 22.472 38.8077 22.472C39.2757 22.472 39.5637 22.832 39.5637 23.264C39.5637 23.876 38.4117 26.288 35.8197 26.288C34.3797 26.288 32.9037 25.208 32.9037 22.508C32.9037 18.764 35.4957 13.544 39.4557 13.544ZM52.945 14.048L53.053 13.94C53.161 13.832 53.341 13.76 53.557 13.76C54.421 13.76 54.457 14.444 54.457 14.552C54.457 14.768 54.385 14.948 54.277 15.128C52.585 16.964 51.505 18.44 50.461 19.916C49.561 21.176 47.617 23.48 46.825 24.236C48.157 23.984 50.101 24.164 51.217 24.38C51.901 24.524 52.513 24.632 53.017 24.632C54.133 24.632 54.169 24.236 54.169 23.552C54.169 23.12 54.421 22.796 54.853 22.76C55.645 22.58 55.753 23.336 55.753 23.732C55.753 25.28 54.601 26.108 53.017 26.108C52.369 26.108 51.685 25.964 50.965 25.856C50.065 25.676 49.129 25.496 48.121 25.496C47.293 25.496 46.465 25.604 45.565 25.892C45.529 25.928 45.421 25.928 45.277 25.928C44.845 25.928 44.485 25.568 44.485 25.172C44.485 24.92 44.557 24.74 44.665 24.596C46.825 22.364 48.013 20.708 49.201 19.016C49.921 18.008 51.109 16.604 51.937 15.668C51.217 15.668 48.553 15.308 48.013 15.308C47.365 15.308 47.221 15.488 47.113 15.704C46.969 16.028 46.681 16.172 46.393 16.172C45.961 16.172 45.565 15.812 45.565 15.38C45.565 15.02 46.141 13.796 48.013 13.796C48.301 13.796 49.093 13.904 49.921 14.012C50.749 14.12 51.577 14.228 51.865 14.228C52.369 14.228 52.765 14.156 52.945 14.048ZM61.4028 19.232C63.0948 19.196 64.8948 18.152 64.8948 16.532C64.8948 15.812 64.3908 15.308 63.4548 15.308C61.6548 15.308 59.0988 17.612 59.0988 21.464C59.0988 22.688 59.4948 24.884 62.0868 24.884C63.0228 24.884 63.9948 24.452 64.6068 23.696C64.7508 23.516 64.9308 23.408 65.1828 23.408C65.6148 23.408 65.9028 23.768 65.9028 24.236C65.9028 24.92 64.1748 26.36 61.9788 26.36C59.2428 26.36 57.4788 24.524 57.4788 21.464C57.4788 16.928 60.6468 13.76 63.4908 13.76C65.6508 13.76 66.5148 15.092 66.5148 16.532C66.5148 19.376 63.5268 20.78 61.4028 20.78C60.9707 20.78 60.6108 20.492 60.6108 20.024C60.6108 19.628 60.9348 19.268 61.4028 19.232ZM77.0546 0.295998H77.2346C79.7906 0.727999 81.2306 2.708 82.0586 5.192C83.4626 4.148 85.0106 3.464 86.7026 3.464C90.4466 3.464 91.9226 6.632 92.2466 7.856C93.8666 5.876 96.0266 4.112 98.4026 4.112C99.6986 4.112 100.851 4.544 101.751 5.48C103.551 7.352 103.983 10.304 103.983 12.932C103.983 17.72 102.579 23.084 100.671 25.856C100.527 26.072 100.239 26.18 99.9866 26.18C99.5546 26.18 99.2306 25.856 99.2306 25.388C99.2306 25.208 99.2666 25.064 99.3386 24.92C101.067 22.472 102.363 17.396 102.363 12.932C102.363 9.692 101.535 5.588 98.3306 5.588C95.7746 5.588 93.3626 8.936 92.8226 9.692C93.1826 10.844 93.3986 12.536 93.3986 14.372C93.3986 20.096 91.7066 26.36 88.4666 26.36C87.8906 26.36 87.3866 26.144 86.9906 25.82C86.4146 25.208 86.1266 24.2 86.1266 22.652C86.1266 18.98 88.1786 13.256 91.0946 9.368C90.8066 8.072 90.2666 7.028 89.5106 6.2C88.7546 5.444 87.7826 4.976 86.5946 4.976C85.1546 4.976 83.7506 5.696 82.4906 6.884C82.9226 8.72 83.0666 11.168 83.0666 13.256C83.0666 20.06 80.7626 26.504 77.0546 26.504C75.2186 26.504 73.7786 24.956 73.7786 21.824C73.7786 17.432 76.6226 10.052 80.7266 6.38C80.0066 3.68 78.7466 2.204 76.9106 1.844C76.5506 1.772 76.2266 1.484 76.2266 1.088C76.2266 0.619998 76.6226 0.295998 77.0546 0.295998ZM81.4466 13.256C81.4466 11.24 81.3026 9.548 81.1226 8C77.8466 11.816 75.3626 17.828 75.3626 21.824C75.3626 22.292 75.3986 25.028 77.0906 25.028C79.4306 25.028 81.4466 19.448 81.4466 13.256ZM91.7786 14.732C91.7786 13.544 91.7426 12.464 91.5626 11.276C89.2586 15.164 87.7106 19.7 87.7106 22.652C87.7106 23.156 87.7826 24.92 88.5026 24.92C90.0146 24.92 91.7066 20.456 91.7786 14.732ZM112.686 13.544C114.738 13.544 115.998 14.876 115.998 17.36C115.998 18.728 115.782 20.312 115.53 21.68C115.386 22.616 115.17 23.84 115.17 24.56C115.17 24.776 115.206 24.92 115.242 25.028C115.314 25.172 115.386 25.28 115.386 25.46C115.386 25.856 114.99 26.216 114.558 26.216C113.766 26.216 113.55 25.208 113.55 24.488C113.55 23.732 113.766 22.724 113.946 21.428C114.162 20.096 114.414 18.692 114.414 17.432C114.414 15.704 113.478 15.056 112.542 15.056C109.806 15.056 107.754 19.232 107.754 22.508C107.754 23.84 108.366 24.776 109.302 24.776C110.274 24.776 110.994 23.912 111.354 22.94C111.462 22.652 111.75 22.472 112.038 22.472C112.506 22.472 112.794 22.832 112.794 23.264C112.794 23.876 111.642 26.288 109.05 26.288C107.61 26.288 106.134 25.208 106.134 22.508C106.134 18.764 108.726 13.544 112.686 13.544ZM126.175 14.048L126.283 13.94C126.391 13.832 126.571 13.76 126.787 13.76C127.651 13.76 127.687 14.444 127.687 14.552C127.687 14.768 127.615 14.948 127.507 15.128C125.815 16.964 124.735 18.44 123.691 19.916C122.791 21.176 120.847 23.48 120.055 24.236C121.387 23.984 123.331 24.164 124.447 24.38C125.131 24.524 125.743 24.632 126.247 24.632C127.363 24.632 127.399 24.236 127.399 23.552C127.399 23.12 127.651 22.796 128.083 22.76C128.875 22.58 128.983 23.336 128.983 23.732C128.983 25.28 127.831 26.108 126.247 26.108C125.599 26.108 124.915 25.964 124.195 25.856C123.295 25.676 122.359 25.496 121.351 25.496C120.523 25.496 119.695 25.604 118.795 25.892C118.759 25.928 118.651 25.928 118.507 25.928C118.075 25.928 117.715 25.568 117.715 25.172C117.715 24.92 117.787 24.74 117.895 24.596C120.055 22.364 121.243 20.708 122.431 19.016C123.151 18.008 124.339 16.604 125.167 15.668C124.447 15.668 121.783 15.308 121.243 15.308C120.595 15.308 120.451 15.488 120.343 15.704C120.199 16.028 119.911 16.172 119.623 16.172C119.191 16.172 118.795 15.812 118.795 15.38C118.795 15.02 119.371 13.796 121.243 13.796C121.531 13.796 122.323 13.904 123.151 14.012C123.979 14.12 124.807 14.228 125.095 14.228C125.599 14.228 125.995 14.156 126.175 14.048ZM134.633 19.232C136.325 19.196 138.125 18.152 138.125 16.532C138.125 15.812 137.621 15.308 136.685 15.308C134.885 15.308 132.329 17.612 132.329 21.464C132.329 22.688 132.725 24.884 135.317 24.884C136.253 24.884 137.225 24.452 137.837 23.696C137.981 23.516 138.161 23.408 138.413 23.408C138.845 23.408 139.133 23.768 139.133 24.236C139.133 24.92 137.405 26.36 135.209 26.36C132.473 26.36 130.709 24.524 130.709 21.464C130.709 16.928 133.877 13.76 136.721 13.76C138.881 13.76 139.745 15.092 139.745 16.532C139.745 19.376 136.757 20.78 134.633 20.78C134.201 20.78 133.841 20.492 133.841 20.024C133.841 19.628 134.165 19.268 134.633 19.232Z" fill="#FFF9ED" />
            </svg>
          </div>

          <div className="absolute top-10 right-0">
            <svg width="103" height="173" viewBox="0 0 103 173" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M168.919 47.0368L131.938 83.9525L172.43 116.98L120.177 116.934L125.455 168.919L88.539 131.938L55.5116 172.43L55.5579 120.177L3.57222 125.455L40.5533 88.5389L0.0618858 55.5115L52.3147 55.5578L47.0369 3.57214L83.9525 40.5532L116.98 0.0618098L116.934 52.3147L168.919 47.0368Z" fill="url(#paint0_linear_514_7870)" />
              <defs>
                <linearGradient id="paint0_linear_514_7870" x1="164.71" y1="45.2676" x2="2.11371" y2="122.381" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#777575" />
                  <stop offset="1" stopColor="#E9E8E8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute top-64 left-8">
            <svg width="34" height="50" viewBox="0 0 34 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M27.0582 42.676C20.2726 49.5583 11.2648 51.6799 6.9387 47.4147C2.61263 43.1494 4.6065 34.1125 11.3921 27.2301C18.1777 20.3477 27.1856 18.2261 31.5116 22.4914C35.8377 26.7566 33.8438 35.7936 27.0582 42.676Z" fill="url(#paint0_linear_514_7871)" />
              <path d="M22.6755 22.9075C15.8899 29.7899 6.88208 31.9115 2.55601 27.6462C-1.77006 23.381 0.223811 14.344 7.00944 7.46165C13.7951 0.579273 22.8029 -1.54233 27.1289 2.72292C31.455 6.98817 29.4611 16.0251 22.6755 22.9075Z" fill="url(#paint1_linear_514_7871)" />
              <defs>
                <linearGradient id="paint0_linear_514_7871" x1="32.1281" y1="8.72658" x2="0.36947" y2="40.9381" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#777575" />
                  <stop offset="1" stopColor="#E9E8E8" />
                </linearGradient>
                <linearGradient id="paint1_linear_514_7871" x1="32.1281" y1="8.72658" x2="0.36947" y2="40.9381" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#777575" />
                  <stop offset="1" stopColor="#E9E8E8" />
                </linearGradient>
              </defs>
            </svg>

          </div>

          <div className="absolute top-16 left-12">
            <svg width="46" height="54" viewBox="0 0 46 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.1832 3.4102L29.5044 13.594L40.8256 23.7778L22.6426 27.188L4.45962 30.5981L11.3214 17.0041L18.1832 3.4102Z" fill="url(#paint0_linear_514_7872)" />
              <path d="M26.9708 50.2657L33.8982 37.0214L40.8256 23.7771L22.6426 27.1873L4.45962 30.5974L15.7152 40.4315L26.9708 50.2657Z" fill="url(#paint1_linear_514_7872)" />
              <defs>
                <linearGradient id="paint0_linear_514_7872" x1="17.5814" y1="3.93261" x2="21.9666" y2="27.3148" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#777575" />
                  <stop offset="1" stopColor="#E9E8E8" />
                </linearGradient>
                <linearGradient id="paint1_linear_514_7872" x1="26.2227" y1="50.0085" x2="21.9665" y2="27.314" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E9E8E8" />
                  <stop offset="1" stopColor="#777575" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute bottom-28 left-0">
            <svg width="85" height="105" viewBox="0 0 85 105" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32.5" cy="52.5" r="52.5" fill="url(#paint0_linear_514_7875)" />
              <defs>
                <linearGradient id="paint0_linear_514_7875" x1="30.548" y1="1.74698" x2="30.548" y2="105" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#777575" />
                  <stop offset="1" stopColor="#E9E8E8" />
                </linearGradient>
              </defs>
            </svg>

          </div>
          <div className="absolute bottom-42 right-2">
            <svg width="82" height="84" viewBox="0 0 82 84" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.2093 15.9844L15.8689 26.6701C14.1437 40.4231 27.7019 51.0516 40.6453 46.0927V46.0927C51.4603 41.9491 63.3624 48.7357 65.3045 60.1533L66.6807 68.2442" stroke="url(#paint0_linear_514_7876)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="paint0_linear_514_7876" x1="23.2217" y1="14.8658" x2="46.6176" y2="75.9312" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#777575" />
                  <stop offset="1" stopColor="#E9E8E8" />
                </linearGradient>
              </defs>
            </svg>

          </div>

          <div className="pt-22 pb-14 px-8 w-full">
            <div className="flex relative items-center">
              <Search className="absolute left-4 text-[#9B9FAB]" size={20} />
              <Input
                className="flex-1 py-4 px-2 pl-12 h-12 border-none text-[#9B9FAB] bg-white rounded-[40px]"
                placeholder="AIとテーマを探そう"
              // value={searchQuery}
              // onChange={e => setSearchQuery(e.target.value)}
              // onKeyDown={(e) => {
              // if (e.key === 'Enter' && searchQuery.trim()) {
              // searchRelatedThemes(searchQuery)
              // }
              // }}
              />

            </div>
          </div>

          <p className="mb-6 text-white font-black text-xl text-center">
            テーマを選ぶ
          </p>

          {/* AIテーマ表示エリア */}
          <div className="w-full max-w-xl rounded-xl shadow-md overflow-visible">
            <div className="p-4">
              <div className="embla" ref={emblaRef}>
                <div className="embla__container flex gap-4">
                  {themes.map((theme, idx) => (
                    <button
                      key={idx}
                      className={`embla__slide flex-shrink-0 p-4 gap-3 rounded-lg flex flex-col items-center justify-center text-center transition aspect-3/4 w-40 relative mx-2 shadow-md text-white
                        ${idx === 0
                      ? 'bg-gradient-to-b from-black to-gray-800'
                      : gradients[(idx - 1) % gradients.length]
                    }
                        ${selected === theme ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/30'}
                        ${selectedIndex === idx ? 'scale-120 z-10' : 'scale-85 opacity-80'}
                      `}
                      style={{ boxShadow: selectedIndex === idx ? '0 4px 24px rgba(0,0,0,0.10)' : undefined }}
                      onClick={() => handleSelect(theme, idx)}
                    >
                      {idx === 0
                        ? (
                            <span className="text-lg font-bold flex flex-col items-center justify-center h-full w-full">
                              <span className="text-3xl mb-2">＋</span>
                              新規作成
                            </span>
                          )
                        : (
                            <>
                              <span className="text-base font-bold">{theme}</span>
                              <img src="/lama.png" alt="" />
                            </>
                          )}
                    </button>
                  ))}
                </div>
              </div>
              {/* ページネーション */}
              <div className="w-full mt-12 flex justify-center">
                <div className="flex justify-center  gap-2 w-fit px-3 py-2 rounded-full opacity-40 bg-[#BFBFBF]">
                  {themes.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${selectedIndex === idx ? 'bg-primary' : 'bg-gray-500'}`}
                      onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* ナビゲーションバー */}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[64px] flex items-center justify-between px-8 bg-gradient-to-br from-[#5B5B5B] to-[#23232A] rounded-full shadow-2xl z-20" style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
                <Link href="/">
                  <Home className="text-white opacity-80" size={28} />
                </Link>
                <Link href="/new">
                  <div className="flex-1 flex justify-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-b from-[#BFBFBF] to-[#888888] shadow-lg">
                      <Plus className="text-white" size={38} />
                    </div>
                  </div>
                </Link>
                <User className="text-white opacity-80" size={28} />
              </div>
            </div>
          </div>
        </>
      )}
      <style jsx global>
        {`
        @keyframes expandCard {
          0% {
            transform: scale(0.2);
            opacity: 0.7;
            border-radius: 32px;
          }
          80% {
            transform: scale(1.08);
            opacity: 1;
            border-radius: 0px;
          }
          100% {
            transform: scale(1);
            opacity: 1;
            border-radius: 0px;
          }
        }
      `}
      </style>
    </div>
  )
}
