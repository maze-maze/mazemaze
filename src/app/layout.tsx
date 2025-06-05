import type { Metadata } from 'next'
import { Providers } from '🎙️/components/providers'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MazeMaze',
  description: 'MazeMazeはポッドキャストを聴くだけでなく、誰でも作って配信できるサービスです。専門家や架空の人物との対話、テーマ選定から構成・原稿の生成、録音サポートまで——すべてがスマホひとつで完結します。スキマ時間に、AIと一緒に話し、創り、届け、そして聴く。MazeMazeは、人とAIが混ざり合いながらあなたの世界観を音で描く、新感覚のポッドキャスト体験を提供します。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
