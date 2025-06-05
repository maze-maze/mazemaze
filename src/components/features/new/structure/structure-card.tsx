'use client'

import { Input } from '🎙️/components/ui/input'
import { Textarea } from '🎙️/components/ui/textarea'
import {
  ChevronRight,
  MoveDown,
  MoveUp,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Props 型定義
interface StructureCardProps {
  title: string
  content: string
  description?: string
  editMode: boolean
  onContentChange: (value: string) => void
  onDescriptionChange?: (value: string) => void
  isSection?: boolean
  onRemove?: () => void
  canRemove?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export default function StructureCard({
  title,
  content,
  description,
  editMode,
  onContentChange,
  onDescriptionChange,
  isSection = false,
  onRemove,
  canRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: StructureCardProps) {
  const [isExpanded, setIsExpanded] = useState(isSection)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (editMode && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [description, content, editMode, isExpanded])

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-white/20 text-white mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          {/* セクション移動ボタン */}
          {isSection
            ? (
                <div className="flex flex-col mr-3">
                  <button
                    onClick={onMoveUp}
                    disabled={!canMoveUp || !editMode}
                    className={`text-gray-400 hover:text-white ${
                      !canMoveUp || !editMode ? 'cursor-not-allowed opacity-30' : ''
                    }`}
                    aria-label="Move section up"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button
                    onClick={onMoveDown}
                    disabled={!canMoveDown || !editMode}
                    className={`text-gray-400 hover:text-white ${
                      !canMoveDown || !editMode ? 'cursor-not-allowed opacity-30' : ''
                    }`}
                    aria-label="Move section down"
                  >
                    <MoveDown size={16} />
                  </button>
                </div>
              )
            : (
                <div className="w-6 h-6 mr-3" />
              )}

          {editMode
            ? (
                <Input
                  type="text"
                  value={content}
                  onChange={e => onContentChange(e.target.value)}
                  className="font-semibold text-gray-100 text-lg w-full bg-transparent border-b border-gray-600 focus:outline-none focus:ring-0 focus:border-white p-1 truncate"
                  placeholder={isSection ? 'セクションタイトル' : title}
                />
              )
            : (
                <h4 className="font-semibold text-gray-100 text-lg truncate">{title}</h4>
              )}
        </div>

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {/* セクション削除ボタン */}
          {editMode && isSection && onRemove && (
            <button
              onClick={onRemove}
              disabled={!canRemove}
              className={`text-gray-400 hover:text-red-400 ${
                !canRemove ? 'cursor-not-allowed opacity-30' : ''
              }`}
              aria-label="Remove section"
            >
              <Trash2 size={16} />
            </button>
          )}
          {/* セクション展開／折りたたみボタン */}
          {isSection && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-300 hover:text-white p-1 rounded-full"
              aria-label={isExpanded ? '折りたたむ' : '展開する'}
            >
              <ChevronRight
                size={22}
                className={`${isExpanded ? 'transform rotate-90' : ''} transition-transform duration-200`}
              />
            </button>
          )}
        </div>
      </div>

      {(isExpanded || !isSection) && (
        <div className="mt-3 pl-9">
          {editMode
            ? (
                <Textarea
                  ref={textAreaRef}
                  value={isSection ? description : content}
                  onChange={e =>
                    isSection && onDescriptionChange
                      ? onDescriptionChange(e.target.value)
                      : onContentChange(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md text-sm bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none overflow-hidden"
                  placeholder={
                    isSection
                      ? 'セクションの具体的な内容や説明'
                      : `${title}の内容説明`
                  }
                  rows={isSection ? 3 : 2}
                />
              )
            : (
                <p className="text-gray-300 text-sm whitespace-pre-wrap bg-gray-800/20 p-3 rounded-md">
                  {isSection ? description : content}
                </p>
              )}
        </div>
      )}
    </div>
  )
}
