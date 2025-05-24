import SignupForm from "@/components/auth/signup-form";
import { Suspense } from "react";
import { Loading } from "@/components/common/loading";

export default function SignupPage() {
  return (
    <Suspense fallback={<Loading variant="page" text="Loading signup form..." />}>
      <SignupForm />
    </Suspense>
  );
}
