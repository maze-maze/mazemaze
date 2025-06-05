import { ArrowLeft } from 'lucide-react'

interface Props {
  theme: string
  label: string
  loading?: boolean
  onBack: () => void
}

export default function Header({ theme, label, loading = false, onBack }: Props) {
  return (
    <>
      <div className="w-full py-5 flex items-center justify-center">
        {/* アイコン例: テーマ名に応じて画像を出し分けたい場合はここで */}
        <div className="mb-2 flex items-center justify-center">
          <img
            src="/lama.png"
            alt="テーマアイコン"
            className="w-8 h-8 inline-block align-middle mr-2"
          />
          <span className="text-gray-100 text-base font-bold">{theme}</span>
        </div>
      </div>

      <div className="flex items-center px-8 justify-between w-full gap-3">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-primary transition-colors"
        >
          <ArrowLeft size={26} />
        </button>
        <p className="text-white font-black text-xl text-center">
          {loading ? 'パーソナリティーを生成中...' : label}
        </p>
        <div />
      </div>
    </>
  )
}
