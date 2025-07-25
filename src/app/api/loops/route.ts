// app/api/loops/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { uploadBlob } from "@/lib/blob";
import { z } from "zod";

const createLoopSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Name is required"),
  order: z.number().int().min(0),
});

/* ------------------------------------------------------------------ */
/*  POST /api/loops  – upload a recorded blob and create Loop record  */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions }) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const fd = await req.formData();
    const file = fd.get("file") as Blob | null;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Validate form data
    const formData = {
      roomId: fd.get("roomId") as string,
      name: (fd.get("name") ?? "Untitled") as string,
      order: Number(fd.get("order") ?? 0),
      duration: fd.has("duration") ? Number(fd.get("duration")) : undefined,
    };

    try {
      createLoopSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Verify room exists and user has access
    const room = await prisma.room.findUnique({
      where: { id: formData.roomId },
      select: {
        id: true,
        hostId: true,
        isPublic: true,
        participants: {
          select: {
            id: true
          }
        }
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Allow upload if:
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
        where: { id: room.id },
        data: {
          participants: {
            connect: {
              id: session.user.id
            }
          }
        }
      });
    }

    // Upload file to blob storage
    let url: string;
    try {
      url = await uploadBlob(file);
    } catch (error) {
      console.error("Blob upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload audio file" },
        { status: 500 }
      );
    }

    // Create loop record
    const loop = await prisma.loop.create({
      data: {
        url,
        roomId: formData.roomId,
        userId: session.user.id,
        name: formData.name,
        order: formData.order,
        duration: formData.duration,
      },
    });

    return NextResponse.json(loop);
  } catch (error) {
    console.error("Error in POST /api/loops:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/loops?roomId=…  – list loops for a room                   */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (roomId) {
    // loops for a specific room, now including user and timestamps
    const loops = await prisma.loop.findMany({
      where: { roomId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        url: true,
        enabled: true,
        order: true,
        volume: true,
        createdAt: true,
        duration: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    return NextResponse.json(loops);
  }

  // all loops for the current user
  const session = await getServerSession({ req, ...authOptions });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const loops = await prisma.loop.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      url: true,
      enabled: true,
      roomId: true,
      volume: true,
      createdAt: true,
      duration: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      room: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  return NextResponse.json(loops);
}
