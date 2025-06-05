// src/components/complete-page/character-info.tsx
'use client'

import { User, Users } from 'lucide-react'
import React from 'react'
import InfoCard from './info-card'

interface Character {
  name: string
  description: string
  tone: string
}

interface CharacterInfoProps {
  mainCharacter?: Character | null
  guestCharacter?: Character | null
}

export default function CharacterInfo({
  mainCharacter,
  guestCharacter,
}: CharacterInfoProps) {
  return (
    <>
      {mainCharacter && (
        <InfoCard title="メインキャラクター" icon={User}>
          <p className="text-gray-300">
            <strong>名前:</strong>
            {' '}
            {mainCharacter.name}
          </p>
          <p className="text-gray-300 mt-1">
            <strong>説明:</strong>
            {' '}
            {mainCharacter.description}
          </p>
          <p className="text-gray-300 mt-1">
            <strong>トーン:</strong>
            {' '}
            {mainCharacter.tone}
          </p>
        </InfoCard>
      )}
      {guestCharacter && (
        <InfoCard title="ゲストキャラクター" icon={Users}>
          <p className="text-gray-300">
            <strong>名前:</strong>
            {' '}
            {guestCharacter.name}
          </p>
          <p className="text-gray-300 mt-1">
            <strong>説明:</strong>
            {' '}
            {guestCharacter.description}
          </p>
          <p className="text-gray-300 mt-1">
            <strong>トーン:</strong>
            {' '}
            {guestCharacter.tone}
          </p>
        </InfoCard>
      )}
    </>
  )
}
