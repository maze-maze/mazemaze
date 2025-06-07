import Link from 'next/link'
import Background from '../layout/backgeound'
import Header from '../layout/header'
import AudioPlayer from './audio-player'
import Character from './character'
import { getContents } from './get-contents'
import Title from './title'

export default async function ContentsPage({ contentsId }: { contentsId: string }) {
  const contents = await getContents(contentsId)

  if (contents === null)
    return
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 h-dvh">
      <Link href="/">
        <Header />
      </Link>
      <Background />
      <Title title={contents.episodeInfo.title} imageUrl={contents.episodeInfo.imageUrl} />
      <Character name={contents.characterInfo.mainCharacter.name} imageUrl={contents.characterInfo.mainCharacter.imageUrl} />
      <Character name={contents.characterInfo.guestCharacter.name} imageUrl={contents.characterInfo.guestCharacter.imageUrl} />
      <div className="flex justify-center items-center mt-10 gap-4">
        <AudioPlayer audioUrl={contents.recordingInfo.audioUrl} />
      </div>
    </div>
  )
}
