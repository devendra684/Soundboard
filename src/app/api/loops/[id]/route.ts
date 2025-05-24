// app/api/loops/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log('Delete request for loop:', id);
    
    // Get session with detailed logging
    const session = await getServerSession({ req, ...authOptions }) as Session & {
      user: { id: string; name?: string };
    };
    console.log('Raw session:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    if (!session.user) {
      console.log('No user in session');
      return NextResponse.json({ error: "No user in session" }, { status: 401 });
    }

    if (!session.user.id) {
      console.log('No user ID in session');
      return NextResponse.json({ error: "No user ID in session" }, { status: 401 });
    }

    // Get the loop to verify it exists
    const loop = await prisma.loop.findUnique({
      where: { id },
      select: { 
        id: true,
        userId: true, 
        roomId: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });
    console.log('Found loop:', JSON.stringify(loop, null, 2));

    if (!loop) {
      console.log('Loop not found');
      return NextResponse.json({ error: "Loop not found" }, { status: 404 });
    }

    // Delete the loop - no authorization check needed
    await prisma.loop.delete({
      where: { id },
    });
    console.log('Loop deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/loops/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
