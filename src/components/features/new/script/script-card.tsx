/* eslint-disable ts/no-use-before-define */
/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { ChevronRight, FileText, MenuSquare } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface ScriptCardProps {
  title: string
  content: string
  editMode: boolean
  onContentChange: (value: string) => void
  isSection?: boolean
}

export default function ScriptCard({
  title,
  content,
  editMode,
  onContentChange,
  isSection = false,
}: ScriptCardProps) {
  const [isExpanded, setIsExpanded] = useState(!isSection) // セクションは折りたたみ、イントロ/アウトロはデフォルトで展開
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (editMode && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [content, editMode, isExpanded])

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-white/20 text-white">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="w-6 h-6 mr-3 flex items-center justify-center text-gray-300">
            {isSection ? <MenuSquare size={20} /> : <FileText size={20} />}
          </div>
          <h4 className="font-semibold text-gray-100 text-lg">{title}</h4>
        </div>
        <button
          className="text-gray-300 hover:text-white ml-2 p-1 rounded-full"
          aria-label={isExpanded ? '折りたたむ' : '展開する'}
        >
          <ChevronRight
            size={22}
            className={`${isExpanded ? 'transform rotate-90' : ''} transition-transform duration-200`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-9">
          {editMode ? (
            <textarea
              ref={textAreaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md text-sm bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none overflow-hidden"
              placeholder={`${title}の台本内容...`}
            />
          ) : (
            <div className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap bg-gray-800/30 p-4 rounded-md">
              {content || (
                <span className="text-gray-500">内容がありません...</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
