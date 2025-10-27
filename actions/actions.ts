"use server";

import { auth } from "@clerk/nextjs/server";
import { adminDb } from "../firebase-admin";
import liveblocks from "@/lib/liveBlocks";

export async function createNewDocument() {
  const { userId } = await auth();

  if (!userId) throw new Error("User not authenticated");

  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({
    title: "New Doc"
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
      roomId: docRef.id
    });

  return { docId: docRef.id };
}

export async function deleteDocument(roomId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  console.log("deletedDocument", roomId);

  try{
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

    return {success: true};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
}