/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { Button } from '🎙️/components/ui/button'
import { ArrowLeft, CheckIcon, PenIcon } from 'lucide-react'
import React from 'react'

interface Props {
  theme: string
  editMode: boolean
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>
  onBack: () => void
}

export default function ScriptHeader({
  theme,
  editMode,
  setEditMode,
  onBack,
}: Props) {
  return (
    <>
      {/* テーマ名表示 */}
      <div className="w-full py-5 flex items-center justify-center">
        <div className="mb-2 flex items-center justify-center">
          <img
            src="/lama.png"
            alt="テーマアイコン"
            className="w-8 h-8 inline-block align-middle mr-2"
          />
          <span className="text-gray-100 text-base font-bold">{theme}</span>
        </div>
      </div>

      {/* タイトルバー */}
      <div className="flex items-center mb-2 px-8 justify-between w-full gap-3">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-primary transition-colors"
        >
          <ArrowLeft size={26} />
        </button>
        <p className="text-white font-black text-xl text-center">原稿を考える</p>
        <div className="flex items-center">
          <Button
            variant="outline"
            className="rounded-full w-8 h-8"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <CheckIcon /> : <PenIcon />}
          </Button>
        </div>
      </div>
    </>
  )
}
