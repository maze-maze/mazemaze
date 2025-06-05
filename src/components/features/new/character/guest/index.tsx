'use client'

import type { Personality } from '../types'
import CharacterSelector from '../character-selector'

interface Props {
  theme: string
  gradient?: string
  onSelect: (p: Personality) => void
  onNext: () => void
  onBack: () => void
  disableSelf?: boolean // ← 追加
}

export default function GuestCharacterSelector({
  theme,
  gradient,
  onSelect,
  onNext,
  onBack,
  disableSelf = false, // ← デフォルトを false に設定
}: Props) {
  return (
    <CharacterSelector
      theme={theme}
      gradient={gradient}
      label="ゲストパーソナリティを選ぶ"
      onSelect={onSelect}
      onNext={onNext}
      onBack={onBack}
      disableSelf={disableSelf} // ← 親から渡されたフラグをそのまま渡す
    />
  )
}
