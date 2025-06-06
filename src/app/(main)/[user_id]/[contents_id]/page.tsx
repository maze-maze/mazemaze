import ContentsPage from '🎙️/components/features/contents/contents-page'

export default async function Contents({ params }: { params: { user_id: string, contents_id: string } }) {
  return <ContentsPage userId={params.user_id} contentsId={params.contents_id} />
}
