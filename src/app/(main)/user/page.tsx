// app/me/page.tsx

import { auth } from '🎙️/lib/auth';
import { client } from '🎙️/lib/hono';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import MePageClient from './me-client-page';

export default async function MePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  // API経由でusernameを取得
  const res = await client.api.me.username.$get(
    {},
    {
      init: {
        headers: await headers(),
      },
    },
  );

  // ステータスコードが200番台でない場合はエラーとして扱う
  if (!res.ok) {
    // ここでエラーページにリダイレクトするなどの処理も検討できます
    throw new Error('Failed to fetch username');
  }

  const data = await res.json();

  // usernameの有無で分岐
  if (!data?.username) {
    redirect('/enter/callback/welcome');
  }

  // ★ 取得したusernameをクライアントコンポーネントに渡す
  return <MePageClient username={data.username} />;
}