import { Suspense } from "react";
import JoinClient from "./join-client";
import { Loading } from "@/components/common/loading";

export default function JoinPage() {
  return (
    <Suspense fallback={<Loading variant="page" text="Loading join room..." />}>
      <JoinClient />
    </Suspense>
  );
}
