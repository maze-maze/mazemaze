import ContentsPage from '🎙️/components/features/contents/contents-page'
import { Suspense } from 'react'

export default async function Contents({ params }: { params: Promise<{ user_id: string, contents_id: string }> }) {
  const { user_id, contents_id } = await params
  return <Suspense><ContentsPage userId={user_id} contentsId={contents_id} /></Suspense>
}
