// app/api/rooms/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession({ req, ...authOptions }) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse invite code
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Missing invite code" }, { status: 400 });
  }

  // 3. Lookup room
  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      participants: {
        select: {
          id: true
        }
      }
    }
  });
  if (!room) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  // 4. Check if user is already a participant or is the host
  const isAlreadyParticipant = room.participants.some(p => p.id === session.user.id);
  const isHost = room.hostId === session.user.id;
  
  if (isAlreadyParticipant || isHost) {
    return NextResponse.json({ roomId: room.id });
  }

  // 5. Add user as participant
  await prisma.room.update({
    where: { id: room.id },
    data: {
      participants: {
        connect: {
          id: session.user.id
        }
      }
    }
  });

  // 6. Success → return the roomId
  return NextResponse.json({ roomId: room.id });
}
