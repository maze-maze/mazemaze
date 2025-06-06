'use server'

export async function getContents(userId: string, contentsId: string) {
  console.log("getContents called with userId:", userId, "and contentsId:", contentsId)

  const contents = {
    episodeInfo: {
      title: `Episode ${contentsId}`,
      imageUrl: '/lama.png',
      // ...
    },
    recordingInfo: {
      recordingId: '12345',
      audioUrl: 'https://www.earsense.org/Earsense/MP3/snippet.mp3',
      duration: 120,
      createdAt: new Date().toISOString(),
      // ...
    },
    characterInfo: {
      mainCharacter: {
        name: `Character ${contentsId}`,
        imageUrl: '/characters/character.png',
        // ...
      },
      guestCharacter: {
        name: `Guest ${contentsId}`,
        imageUrl: '/characters/guest.png',
        // ...
      }
    }
  }
  return contents
}
