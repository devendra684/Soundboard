import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const mixdowns = await prisma.mixdown.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      roomId: true,
      url: true,
    },
  });

  return NextResponse.json(mixdowns);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { roomId, url } = await req.json();
  if (!roomId || !url) {
    return NextResponse.json(
      { error: "Missing roomId or url in request body" },
      { status: 400 }
    );
  }

  // Check if room exists and if it's public or user has access
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      isPublic: true,
      hostId: true,
      participants: {
        select: { id: true }
      }
    }
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Allow mixdown if:
  // 1. Room is public OR
  // 2. User is host OR
  // 3. User is a participant
  const isHost = room.hostId === session.user.id;
  const isParticipant = room.participants.some(p => p.id === session.user.id);

  if (!room.isPublic && !isHost && !isParticipant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // If room is public and user is not a participant, add them
  if (room.isPublic && !isParticipant && !isHost) {
    await prisma.room.update({
      where: { id: roomId },
      data: {
        participants: {
          connect: {
            id: session.user.id
          }
        }
      }
    });
  }

  const mixdown = await prisma.mixdown.create({
    data: {
      userId: session.user.id,
      roomId,
      url,
    },
  });

  return NextResponse.json(mixdown);
}
