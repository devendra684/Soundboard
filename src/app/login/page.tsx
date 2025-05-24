import AuthPage from "@/components/auth/auth-page";
import { Suspense } from "react";
import { Loading } from "@/components/common/loading";

export const metadata = { title: "Log in – SoundBoard" };

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading variant="page" text="Loading login form..." />}>
      <AuthPage variant="login" />
    </Suspense>
  );
}
