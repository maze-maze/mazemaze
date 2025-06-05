'use client'

import CharacterSelector from "../character-selector"
import { Personality } from "../types"


interface Props {
  theme: string
  gradient?: string
  onSelect: (p: Personality) => void
  onNext: () => void
  onBack: () => void
  disableSelf?: boolean 
}

export default function MainCharacterSelector({
  theme,
  gradient,
  onSelect,
  onNext,
  onBack,
  disableSelf = false, 
}: Props) {
  return (
    <CharacterSelector
      theme={theme}
      gradient={gradient}
      label="メインパーソナリティを選ぶ"
      onSelect={onSelect}
      onNext={onNext}
      onBack={onBack}
      disableSelf={disableSelf}
    />
  )
}
