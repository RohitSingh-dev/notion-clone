"use server";

import { auth } from "@clerk/nextjs/server";
import { adminDb } from "../firebase-admin";

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
