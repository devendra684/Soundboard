import { Suspense } from "react";
import JoinClient from "./join-client";
import { Loading } from "@/components/common/loading";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0850] via-[#2a0c73] to-[#1e1a4b]">
      <Suspense fallback={<Loading variant="overlay" text="Loading join room..." />}>
        <JoinClient />
      </Suspense>
    </div>
  );
}
