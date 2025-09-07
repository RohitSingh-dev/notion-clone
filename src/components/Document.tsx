"use client"

import { FormEvent, useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import React from "react";

type DocumentProps = {
  id: string; 
};

function Document({id}: DocumentProps) {
  const [data, loading, error] = useDocumentData(doc(db, "documents", id));
  const [input, setInput] = useState("");
  const [isUpdating, startTransition] = useTransition();

  useEffect(() => {
    if (data) {
      setInput(data.title);
    }
  }, [data]);

  const updateTitle = (e: FormEvent) => {
    e.preventDefault();

    if (input.trim()) {
      startTransition(async () => {
        await updateDoc(doc(db, "documents", id), { title: input, });
      });
    }
  };

  return (
    <div>
      <div>
        <form onSubmit={updateTitle}>
          {/*  update title...  */}
          <Input value={input} onChange={(e) => setInput(e.target.value)} />

          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Updating..." : "Update"}
          </Button>

          {/*  IF  */}
          {/*  isOwner && InviteUser, DeleteDocument */}
        </form>
      </div>

      <div>
        {/* ManageUsers */}

        {/* Avatars */}
      </div>

      {/* Collaborate Editor */}
    </div>
  )
}
export default Document