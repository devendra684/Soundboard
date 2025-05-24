// app/rooms/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Session } from "next-auth";
import RoomsClient from "./rooms-client";

export default async function RoomsPage() {
  const session = (await getServerSession(authOptions)) as Session & {
    user: {
      id: string;
    };
  };
  if (!session?.user) redirect("/signin");
  const userId = session.user.id;

  // 1️⃣ User's rooms
  const rooms = await prisma.room.findMany({
    where: {
      OR: [{ hostId: userId }, { loops: { some: { userId } } }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      bpm: true,
      keySig: true,
      hostId: true,
      isPublic: true,
    },
  });

  // 2️⃣ All public rooms (excluding those the user already sees)
  const allPublic = await prisma.room.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      bpm: true,
      keySig: true,
      hostId: true,
    },
  });
  const publicRooms = allPublic.filter(
    (r) => !rooms.some((ur) => ur.id === r.id)
  );

  const hosted = rooms.filter((r) => r.hostId === userId);
  const collaborated = rooms.filter((r) => r.hostId !== userId);

  return <RoomsClient hosted={hosted} collaborated={collaborated} publicRooms={publicRooms} />;
}
