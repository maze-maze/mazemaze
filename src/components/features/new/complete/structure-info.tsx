// src/components/complete-page/structure-info.tsx
'use client'

import React from 'react'
import InfoCard from './info-card'
import { BookText } from 'lucide-react'

interface Section {
  title: string
  description: string
}

interface Structure {
  intro: string
  sections: Section[]
  outro: string
}

interface StructureInfoProps {
  structure?: Structure | null
}

export default function StructureInfo({ structure }: StructureInfoProps) {
  if (!structure) return null

  return (
    <InfoCard title="構成" icon={BookText}>
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-200 mb-1">イントロ:</h4>
          <p className="pl-4 border-l-2 border-primary/60 text-gray-300 text-sm">
            {structure.intro}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-200 mb-1">セクション:</h4>
          <ul className="pl-4 space-y-2">
            {structure.sections.map((sec, index) => (
              <li
                key={index}
                className="pl-4 border-l-2 border-primary/60 py-1"
              >
                <p className="font-medium text-gray-200">{sec.title}</p>
                <p className="text-gray-400 text-sm">{sec.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-200 mb-1">アウトロ:</h4>
          <p className="pl-4 border-l-2 border-primary/60 text-gray-300 text-sm">
            {structure.outro}
          </p>
        </div>
      </div>
    </InfoCard>
  )
}
