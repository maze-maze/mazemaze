/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { Loader2 } from 'lucide-react'
import React from 'react'

interface Props {
  generating: boolean
}

export default function ScriptLoading({ generating }: Props) {
  return (
    <div className="flex-1 flex justify-center items-center h-64">
      <Loader2 size={32} className="animate-spin mr-3 text-white" />
      <span className="text-gray-400 text-lg">
        {generating ? '台本を生成中...' : 'データを読み込み中...'}
      </span>
    </div>
  )
}
