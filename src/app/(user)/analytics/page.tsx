// app/(your-folder)/dashboard/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Music, Layers, Download, Activity } from "lucide-react";
import { Session } from "next-auth";

export default async function Dashboard() {
  // 🔐 Fetch session
  const session = (await getServerSession(authOptions)) as Session & {
    user: {
      id: string;
    };
  };
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  // Fetch counts & recent rooms in one go
  const [
    [roomsHosted, loopsRecorded, sessionsCount, mixdownsExported],
    recentRooms,
  ] = await Promise.all([
    prisma.$transaction([
      prisma.room.count({ where: { hostId: userId } }),
      prisma.loop.count({ where: { userId } }),
      prisma.room.count({
        where: {
          OR: [{ hostId: userId }, { loops: { some: { userId } } }],
        },
      }),
      prisma.mixdown.count({ where: { userId } }),
    ]),
    prisma.room.findMany({
      where: {
        OR: [{ hostId: userId }, { loops: { some: { userId } } }],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        bpm: true,
        keySig: true,
      },
    }),
  ]);

  const averageLoopsPerSession =
    sessionsCount > 0 ? loopsRecorded / sessionsCount : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">Your Analytics</h1>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#006bff] flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white">Jam Rooms Hosted</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{roomsHosted}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006bff] to-[#00d2ff] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white">Loops Recorded</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{loopsRecorded}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ffb347] flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white">Mixdowns Exported</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{mixdownsExported}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ffb347] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white">Avg. Loops/Session</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">
                {averageLoopsPerSession.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Recent Rooms */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Jam Rooms</h2>
          <div className="space-y-4">
            {recentRooms.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <p className="text-white/80 text-center">No rooms yet 🎸</p>
                </CardContent>
              </Card>
            ) : (
              recentRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="block"
                >
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-semibold text-white">{room.title}</p>
                          <p className="text-white/80">
                            {room.bpm} BPM
                            {room.keySig ? ` \u2022 ${room.keySig}` : ""}
                          </p>
                        </div>
                        <time
                          dateTime={room.createdAt.toISOString()}
                          className="text-white/60"
                        >
                          {room.createdAt.toLocaleDateString()}
                        </time>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
