import AuthPage from "@/components/auth/auth-page";
import { Suspense } from "react";
import { Loading } from "@/components/common/loading";

export const metadata = { title: "Log in – SoundBoard" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Suspense fallback={<Loading variant="overlay" text="Loading login form..." />}>
        <AuthPage variant="login" />
      </Suspense>
    </div>
  );
}
