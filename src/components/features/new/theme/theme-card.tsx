import { cn } from "🎙️/lib/utils"

// テーマカードコンポーネント
export function ThemeCard({
    theme,
    gradient,
    isActive,
    onSelect,
  }: {
    theme: string
    gradient: string
    isActive: boolean
    onSelect: () => void
  }) {
    return (
      <button
        className={cn(
          'p-4 gap-3 rounded-lg flex flex-col items-center justify-center text-center transition aspect-3/4 w-40 h-full relative',
          isActive ? 'scale-120 z-10' : 'scale-90 opacity-80',
          gradient
        )}
        onClick={onSelect}
      >
        <span className="text-base font-bold text-white">{theme}</span>
        <img src="/lama.png" alt="" />
      </button>
    )
  }