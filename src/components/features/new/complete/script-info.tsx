// src/components/complete-page/script-info.tsx
'use client'

import React from 'react'
import InfoCard from './info-card'
import { ClipboardList } from 'lucide-react'

interface ScriptInfoProps {
  script?: string | null
}

export default function ScriptInfo({ script }: ScriptInfoProps) {
  return (
    <InfoCard title="台本" icon={ClipboardList}>
      <div className="bg-gray-900/60 p-3 sm:p-4 rounded-md max-h-[50vh] sm:max-h-96 overflow-y-auto shadow-inner">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
          {script || '台本が生成されていません。'}
        </pre>
      </div>
    </InfoCard>
  )
}
