"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { adminDb } from "../firebase-admin";
import liveblocks from "@/lib/liveBlocks";

export async function createNewDocument() {
  const { userId } = await auth();

  if (!userId) throw new Error("User not authenticated");

  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({
    title: "New Doc",
  });

  await adminDb
    .collection("users")
    .doc(userId)
    .collection("rooms")
    .doc(docRef.id)
    .set({
      userId,
      role: "owner",
      createdAt: new Date(),
      roomId: docRef.id,
    });

  return { docId: docRef.id };
}

export async function deleteDocument(roomId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  console.log("deletedDocument", roomId);

  try {
    //delete the document reference itself
    await adminDb.collection("documents").doc(roomId).delete();

    const query = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();

    //delete the room references in the user's collection for every user in the room
    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    //delete the room in liveblocks
    await liveblocks.deleteRoom(roomId);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function inviteUserToDocument(roomId: string, email: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  console.log("inviteUserToDocument", roomId, email);

  try {
    // 🔍 Look up the invited user by email in Clerk
    const client = await clerkClient();
    const users = await client.users.getUserList({ emailAddress: [email] });

    if (!users || users.data.length === 0) {
      console.error("User not found in Clerk:", email);
      return { success: false, message: "User not found" };
    }

    const invitedUser = users.data[0];
    const invitedUserId = invitedUser.id;

    // ✅ Save using Clerk userId
    await adminDb
      .collection("users")
      .doc(invitedUserId)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: invitedUserId, // <--- Fix: use Clerk user ID
        role: "editor",
        createdAt: new Date(),
        roomId: roomId,
      });

    return { success: true };
  } catch (error) {
    console.error("Invite error:", error);
    return { success: false, message: "Server error" };
  }
}

export async function removeUsersFromDocument(roomId: string, targetUserId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    await adminDb
      .collection("users")
      .doc(targetUserId)
      .collection("rooms")
      .doc(roomId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false};
  }
}
