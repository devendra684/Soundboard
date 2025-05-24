"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { togglePublicRoom } from "@/app/actions/room";

interface Props {
  roomId: string;
  initialIsPublic: boolean;
}

export default function PublicToggle({ roomId, initialIsPublic }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const router = useRouter();

  const toggle = async () => {
    const formData = new FormData();
    formData.append("roomId", roomId);
    formData.append("makePublic", (!isPublic).toString());
    
    await togglePublicRoom(formData);
    setIsPublic(!isPublic);
    // re-fetch server data (e.g. your publicRooms list)
    router.refresh();
  };

  return (
    <div className="p-4 border-t flex items-center justify-between">
      <span
        className={
          isPublic
            ? "inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
            : "inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
        }
      >
        {isPublic ? "Public" : "Private"}
      </span>
      <button
        onClick={toggle}
        className="text-sm underline hover:text-indigo-600"
      >
        {isPublic ? "Make Private" : "Make Public"}
      </button>
    </div>
  );
}
