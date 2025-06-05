import NabigationBarContainer from '🎙️/components/ui/nabigation-bar-container'
import Background from '../layout/backgeound'
import { SignInButton } from './SignInButton'
import Header from '../layout/header'

export default function SignInPage() {
  // 表示するテーマリストをアクティブなタブに応じて決定
  return (
    <div className="relative bg-[#0E0B16] min-h-screen flex flex-col items-center w-full h-full">

      {/* ヘッダー部分 - 次へボタンを右上に配置 */}
      <Header/>

      <Background />

      <div className="flex items-center justify-center mb-20 flex-1 z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ログインしてください</h1>
          <SignInButton />
        </div>
      </div>

      {/* ナビゲーションバー */}
      <NabigationBarContainer />

    </div>
  )
}
