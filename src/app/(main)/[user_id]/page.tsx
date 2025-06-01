import { headers } from "next/headers";
import { SignInButton } from "🎙️/components/features/auth/SignInButton";
import SignInPage from "🎙️/components/features/auth/SignInPage";
import UserPage from "🎙️/components/features/user/UserPage";
import { auth } from "🎙️/lib/auth";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return (
            <SignInPage/>
        );
    }
    return (
        <UserPage  name={session.user.name} />
    );
}
