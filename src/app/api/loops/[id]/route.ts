// app/api/loops/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { enabled, volume } = await req.json();

  if (typeof enabled !== "boolean" || typeof volume !== "number") {
    return NextResponse.json(
      { error: "Invalid payload: enabled must be boolean and volume number." },
      { status: 400 }
    );
  }

  const updated = await prisma.loop.update({
    where: { id: id },
    data: { enabled, volume },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Get the loop to check ownership
    const loop = await prisma.loop.findUnique({
      where: { id: params.id },
      select: { userId: true, roomId: true },
    });

    if (!loop) {
      return NextResponse.json({ error: "Loop not found" }, { status: 404 });
    }

    // Check if user is the owner of the loop or the room host
    const room = await prisma.room.findUnique({
      where: { id: loop.roomId },
      select: { hostId: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (loop.userId !== session.user.id && room.hostId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the loop
    await prisma.loop.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/loops/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
