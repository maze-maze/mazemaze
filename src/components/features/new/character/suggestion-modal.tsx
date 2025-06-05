'use client'

import type { Personality } from './types'

interface Props {
  suggestions: Personality[]
  onClose: () => void
  onChoose: (p: Personality) => void
}

export default function SuggestionModal({ suggestions, onClose, onChoose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md p-6 bg-[#0E0B16] rounded-t-2xl shadow-2xl animate-slideup">
        <button
          className="absolute top-3 right-4 text-2xl text-white"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="mb-2 text-xl font-bold text-white">AI 提案</h3>
        {suggestions.map((p, i) => (
          <div key={i} className="mb-4">
            <p className="font-bold text-white">{p.name}</p>
            <p className="text-sm text-gray-200">{p.description}</p>
            <p className="text-sm text-gray-200">
              トーン:
              {p.tone}
            </p>
            <button
              className="mt-2 text-primary"
              onClick={() => onChoose(p)}
            >
              選択する
            </button>
          </div>
        ))}
      </div>

      <style jsx>
        {`
        .animate-slideup {
          animation: slideup-modal 0.32s cubic-bezier(.4, 1.4, .6, 1) both;
        }
        @keyframes slideup-modal {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}
      </style>
    </div>
  )
}
