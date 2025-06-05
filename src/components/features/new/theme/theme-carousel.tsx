import { ThemeCard } from './theme-card'

// テーマカードコンポーネント
export // AIテーマ表示用コンポーネント
function ThemeCarousel({
  themes,
  gradients,
  activeIndex,
  onSelect,
  sliderRef,
}: {
  themes: string[]
  gradients: string[]
  activeIndex: number
  onSelect: (theme: string, idx: number) => void
  sliderRef: React.RefObject<HTMLDivElement>
}) {
  return (
    <div className="w-full max-w-xl rounded-xl shadow-md overflow-visible">
      <div className="p-4" ref={sliderRef}>
        <div className="flex">
          {themes.map((theme, idx) => (
            <div key={idx} className="w-fit px-4">
              <ThemeCard
                theme={theme}
                gradient={gradients[idx % gradients.length]}
                isActive={activeIndex === idx}
                onSelect={() => onSelect(theme, idx)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
