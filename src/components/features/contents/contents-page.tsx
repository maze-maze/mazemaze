import { getContents } from './get-contents'
import Title from './title'
import Character from './character'
import AudioPlayer from './audio-player'
import Background from '../layout/backgeound'
import BackButton from './back-button'

export default async function ContentsPage({ userId, contentsId }: { userId: string, contentsId: string }) {
  const contents = await getContents(userId, contentsId)

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 h-dvh">
      <Background />
      <Title title={contents.episodeInfo.title} imageUrl={contents.episodeInfo.imageUrl} />
      <Character name={contents.characterInfo.mainCharacter.name} imageUrl={contents.characterInfo.mainCharacter.imageUrl} />
      <Character name={contents.characterInfo.guestCharacter.name} imageUrl={contents.characterInfo.guestCharacter.imageUrl} />
      <div className="flex justify-center items-center mt-10 gap-4">
        <BackButton userId={userId} />
        <AudioPlayer audioUrl={contents.recordingInfo.audioUrl} />
        <div className="size-12"></div>
      </div>
    </div>
  )
}
