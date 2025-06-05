import { cn } from "🎙️/lib/utils"

// ページネーションドットコンポーネント
export function PaginationDots({
    count,
    activeIndex,
    onDotClick,
  }: {
    count: number
    activeIndex: number
    onDotClick: (idx: number) => void
  }) {
    return (
      <div className="w-full mt-8 flex justify-center">
        <div className="flex justify-center gap-2 w-fit px-3 py-2 rounded-full opacity-40 bg-[#BFBFBF]">
          {Array.from({ length: count }).map((_, idx) => (
            <button
              key={idx}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                activeIndex === idx ? 'bg-primary' : 'bg-gray-500'
              )}
              onClick={() => onDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    )
  }