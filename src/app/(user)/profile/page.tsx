// app/profile/page.tsx  (server component)

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Music, Layers, Download } from "lucide-react";
import { Session } from "next-auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions) as Session & {
    user: {
      id: string;
    };
  };
  
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [hosted, mix] = await Promise.all([
    prisma.room.count({
      where: { hostId: userId },
    }),
    prisma.mixdown.count({
      where: { userId },
    }),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Rooms Hosted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-white">{hosted}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Mixdowns Exported</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-white">{mix}</p>
        </CardContent>
      </Card>
    </div>
  );
}
