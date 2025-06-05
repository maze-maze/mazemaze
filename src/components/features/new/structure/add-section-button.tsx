/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { PlusCircle } from 'lucide-react'

interface Props {
  onClick: () => void
  editMode: boolean
}

export default function AddSectionButton({ onClick, editMode }: Props) {
  if (!editMode) return null

  return (
    <div className="flex justify-center my-2 h-6 items-center">
      <div className="h-px bg-white/20 w-1/3"></div>
      <button
        onClick={onClick}
        className="text-gray-400 hover:text-white transition-colors flex items-center mx-4"
        aria-label="Add section"
      >
        <PlusCircle size={20} />
      </button>
      <div className="h-px bg-white/20 w-1/3"></div>
    </div>
  )
}
