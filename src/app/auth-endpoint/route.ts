import liveblocks from "@/lib/liveBlocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../firebase-admin";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (
    !sessionClaims ||
    typeof sessionClaims.email !== "string" ||
    typeof sessionClaims.fullName !== "string" ||
    typeof sessionClaims.image !== "string"
  ) {
    return new Response("Missing or invalid user info", { status: 400 });
  }

  const { room } = await req.json();

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: sessionClaims?.fullName,
      email: sessionClaims?.email,
      avatar: sessionClaims?.image,
    },
  });

  const usersInRoom = await adminDb
    .collectionGroup("rooms")
    .where("userId", "==", sessionClaims?.email)
    .get();

  const userInRoom = usersInRoom.docs.find((doc) => doc.id === room);

  if (userInRoom?.exists) {
    session.allow(room, session.FULL_ACCESS);
    const { body, status } = await session.authorize();
    return new Response(body, { status });
  } else {
    return NextResponse.json(
      { message: "You are not in this room" },
      { status: 403 }
    );
  }
}
