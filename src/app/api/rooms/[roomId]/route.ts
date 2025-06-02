// app/api/rooms/[roomId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest, context: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await context.params;

  // 1️⃣ Fetch room first to check if it's public
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      title: true,
      bpm: true,
      keySig: true,
      code: true,
      isPublic: true,
      hostId: true,
      createdAt: true,
      _count: {
        select: {
          participants: true
        }
      }
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // 2️⃣ If room is public, allow access without authentication
  if (room.isPublic) {
    return NextResponse.json({
      ...room,
      usersCount: room._count.participants
    });
  }

  // 3️⃣ For private rooms, require authentication
  const session = await getServerSession({ req, ...authOptions });
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // 4️⃣ Return room data
  return NextResponse.json({
    ...room,
    usersCount: room._count.participants
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await context.params;

  // 1️⃣ Auth
  const session = await getServerSession({ req, ...authOptions }) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // 2️⃣ Ensure the user is the host
  const existing = await prisma.room.findUnique({
    where: { id: roomId },
    select: { hostId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (existing.hostId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3️⃣ Parse updates
  const { title, bpm, keySig, isPublic } = await req.json();
  const data: Record<string, any> = {};
  if (title !== undefined) data.title = title;
  if (bpm !== undefined) data.bpm = bpm;
  if (keySig !== undefined) data.keySig = keySig;
  if (isPublic !== undefined) data.isPublic = isPublic;

  // 4️⃣ Perform update
  const updated = await prisma.room.update({
    where: { id: roomId },
    data,
    select: {
      id: true,
      title: true,
      bpm: true,
      keySig: true,
      code: true,
      isPublic: true,
      hostId: true,
      createdAt: true,
      _count: {
        select: {
          participants: true
        }
      }
    },
  });

  return NextResponse.json({
    ...updated,
    usersCount: updated._count.participants
  });
}
