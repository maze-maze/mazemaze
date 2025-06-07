'use client'

import { cn } from '🎙️/lib/utils'
import React from 'react'

// ★★★ 1. 受け取るデータの型を定義します ★★★
// episodeオブジェクトにはgradientやtitleが含まれています
interface Episode {
  id: string
  title: string
  gradient: string | null
  mainCharacter: {
    name: string
    imageUrl: string
  } | null
}

// ★★★ 2. propsの型を更新します ★★★
// 不要になった `gradients` を削除し、`displayThemes` の型を `Episode[]` に変更
interface ThemeGridProps {
  displayThemes: Episode[]
}

export default function ThemeGrid({ displayThemes }: ThemeGridProps) {
  if (displayThemes.length === 0) {
    return (
      <div className="col-span-2 text-center text-gray-400 py-10">
        投稿されたテーマはありません。
      </div>
    )
  }

  return (
    <>
      {/* ★★★ 3. map処理を更新します ★★★ */}
      {displayThemes.map(episode => (
        <button
          // keyにはユニークなepisode.idを使用
          key={episode.id}
          className={cn(
            'p-4 w-full gap-3 rounded-lg flex flex-col items-center justify-center text-center transition aspect-2/3 relative',
            // episodeオブジェクトから直接gradientクラスを取得します
            // もしgradientが設定されていなければ、デフォルトの背景色を適用します
            episode.gradient ?? 'bg-gradient-to-b from-gray-700 to-gray-900',
          )}
        >
          {/* episodeオブジェクトからタイトルを表示 */}
          <span className="text-base font-bold text-white">{episode.title}</span>
          {/* episodeオブジェクトからキャラクター画像を表示 */}
          <img
            src={episode.mainCharacter?.imageUrl ?? '/lama.png'}
            alt={episode.mainCharacter?.name ?? 'キャラクター'}
            className="w-12 h-12 rounded-full object-cover"
          />
        </button>
      ))}
    </>
  )
}
