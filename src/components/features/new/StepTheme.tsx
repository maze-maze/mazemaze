'use client'
import { Button } from '🎙️/components/ui/button'
import { Input } from '🎙️/components/ui/input'
import {
  CheckCircle2,
  ChevronRight,
  ListTodo,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeSelector({
  onSelect,
  onNext,
}: {
  onSelect: (theme: string) => void
  onNext: () => void
}) {
  const [themes, setThemes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)
  const [showInitialThemes, setShowInitialThemes] = useState(true)

  // 初回ロード時にテーマを取得
  useEffect(() => {
    fetchThemes()
  }, [])

  // テーマを取得する関数
  const fetchThemes = async (query: string = '') => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query }),
      })

      if (!res.ok) {
        throw new Error('Failed to fetch themes')
      }

      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        if (query) {
          // 検索結果を表示
          setThemes(data)
          setShowInitialThemes(false)
        }
        else {
          // 初期テーマをセット
          setThemes(data)
          setShowInitialThemes(true)
        }
      }
      else {
        setError(
          'テーマを取得できませんでした。別のキーワードをお試しください。',
        )
      }
    }
    catch (err) {
      console.error('Error fetching themes:', err)
      setError('エラーが発生しました。もう一度お試しください。')
    }

    setLoading(false)
    setSearching(false)
  }

  // カードを押したとき
  const handleSelect = (theme: string) => {
    setSelected(theme)
    onSelect(theme)
  }

  // テーマをリフレッシュ
  const refreshThemes = () => {
    setSearching(true)
    fetchThemes(showInitialThemes ? '' : searchQuery)
  }

  // 関連テーマを検索
  const searchRelatedThemes = (query: string = '') => {
    if (!query.trim())
      return
    setSearching(true)
    fetchThemes(query)
  }

  // テーマの一覧表示に戻る
  const returnToThemeList = () => {
    setShowInitialThemes(true)
    setSearchQuery('')
    fetchThemes('')
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* ヘッダー部分 - 次へボタンを右上に配置 */}
      <div className="w-full flex justify-end items-center px-4 md:px-8 py-4">
        {selected && (
          <Button onClick={onNext} className="flex items-center" size="sm">
            次へ進む
            <ChevronRight className="ml-1" size={16} />
          </Button>
        )}
      </div>

      <h1 className="text-3xl font-serif text-center mt-6 mb-4">
        What topics interest you?
      </h1>
      <p className="mb-6 text-gray-500 text-center">
        {selected
          ? 'テーマが選択されました。'
          : '気になるテーマを選ぶか、キーワードを検索してください。'}
      </p>

      {/* AIテーマ表示エリア */}
      <div className="w-full max-w-xl mb-8 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-lg">AIが提案するテーマ</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshThemes}
            className="text-gray-500 flex items-center"
            disabled={loading || searching}
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${searching ? 'animate-spin' : ''}`}
            />
            更新
          </Button>
        </div>

        <div className="p-4">
          {loading || searching
            ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="animate-spin mr-2" />
                  <span className="text-gray-500">テーマを生成中...</span>
                </div>
              )
            : error
              ? (
                  <div className="text-red-500 text-center">{error}</div>
                )
              : themes.length > 0
                ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {themes.map((theme, idx) => (
                        <button
                          key={idx}
                          className={`p-4 rounded-lg bg-white flex flex-col items-center justify-center text-center border transition h-24 hover:shadow-md relative ${
                            selected === theme
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/30'
                          }`}
                          onClick={() => handleSelect(theme)}
                        >
                          {selected === theme && (
                            <CheckCircle2
                              className="absolute top-2 right-2 text-primary"
                              size={16}
                            />
                          )}
                          {theme}
                        </button>
                      ))}
                    </div>
                  )
                : (
                    <div className="text-center text-gray-500 py-8">
                      <ListTodo className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>まだテーマがありません。</p>
                      <p className="text-sm">
                        検索キーワードを入力して「テーマを探す」ボタンを押してください。
                      </p>
                    </div>
                  )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex">
            <Input
              className="flex-1 mr-2"
              placeholder="キーワードを入力..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  searchRelatedThemes(searchQuery)
                }
              }}
            />
            <Button
              onClick={() => searchRelatedThemes(searchQuery)}
              disabled={!searchQuery.trim() || loading || searching}
              className="bg-gray-800 hover:bg-gray-900"
            >
              <Search className="w-4 h-4 mr-2" />
              テーマを探す
            </Button>
          </div>
        </div>
      </div>

      {/* 選択されたテーマの表示 */}
      {selected && (
        <div className="w-full max-w-md bg-primary/5 rounded-lg p-4 mb-4 text-center">
          <p className="text-sm text-gray-500 mb-1">選択中のテーマ:</p>
          <p className="text-lg font-medium text-primary">{selected}</p>
        </div>
      )}

      {/* 戻るボタン - 検索後表示 */}
      {!showInitialThemes && (
        <Button variant="outline" className="mb-8" onClick={returnToThemeList}>
          テーマの一覧に戻る
        </Button>
      )}

      {/* 次へボタンは上部に移動済み */}
    </div>
  )
}
