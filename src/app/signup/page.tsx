import SignupForm from "@/components/auth/signup-form";
import { Suspense } from "react";
import { Loading } from "@/components/common/loading";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Suspense fallback={<Loading variant="overlay" text="Loading signup form..." />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
