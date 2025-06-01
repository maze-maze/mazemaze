// app/me/page.tsx

import { auth } from '🎙️/lib/auth'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { env } from '🎙️/env.mjs';

export default async function MePage() {
  const cookieHeader = cookies().toString();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/me/username`, {
    method: "GET",
    headers: { cookie: cookieHeader },
  });

  const { username } = await res.json();

  if (!username) {
    redirect(`/enter/callback/welcome`);
  }

  if (username) {
    redirect(`/${username}`);
  }

}
