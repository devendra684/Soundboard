import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Session } from "next-auth";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
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
    <AnalyticsClient 
      roomsHosted={roomsHosted}
      loopsRecorded={loopsRecorded}
      sessionsCount={sessionsCount}
      mixdownsExported={mixdownsExported}
      averageLoopsPerSession={averageLoopsPerSession}
      recentRooms={recentRooms}
    />
  );
}
