import Background from '🎙️/components/features/layout/backgeound'
import Header from '🎙️/components/features/layout/header'
import { Loader2 } from 'lucide-react'

export default async function Load() {
  return (
    <>
      <div className="relative bg-[#0E0B16] min-h-screen flex flex-col items-center w-full h-full">
        <Header />
        <Background />
        <div className="w-full flex flex-1 items-center justify-center mb-20">
          <Loader2 className="animate-spin size-15" />
        </div>
      </div>
    </>
  )
}
