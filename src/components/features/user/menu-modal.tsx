// src/components/user-page/menu-modal.tsx
'use client'

import { signOut } from '🎙️/lib/auth-client'
import { cn } from '🎙️/lib/utils'
import {
  CreditCard,
  LogOut,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface MenuModalProps {
  isOpen: boolean
  onClose: () => void
  onBilling: () => void
}

export default function MenuModal({ isOpen, onClose, onBilling }: MenuModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(timer)
    }
    else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen)
    return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-30 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-[#0E0B16] text-white p-5 rounded-t-2xl shadow-2xl z-40 transition-transform duration-300 ease-out',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="menu-modal-title" className="text-lg font-semibold text-gray-300">
            メニュー
          </h2>
          <button onClick={onClose} className="p-1 text-white" aria-label="閉じる">
            <X size={24} />
          </button>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  onBilling()
                  onClose()
                }}
                className="flex items-center w-full p-3 hover:bg-gray-700 rounded-lg transition-colors duration-150 ease-in-out text-gray-200"
              >
                <CreditCard size={20} className="mr-4 text-sky-400" />
                Billing
              </button>
            </li>
            <li>
              <button
                onClick={() => signOut('/user')}
                className="flex items-center w-full p-3 hover:bg-gray-700 rounded-lg transition-colors duration-150 ease-in-out text-red-400 hover:text-red-300"
              >
                <LogOut size={20} className="mr-4" />
                ログアウト
              </button>
            </li>
          </ul>
        </nav>
        <div className="pb-safe-area-inset-bottom" />
      </div>
    </>
  )
}
