"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export function JoinRoomForm() {
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  const handleJoinRoom = () => {
    if (!roomCode) return;
    router.push(`/rooms/join?token=${roomCode}`);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#ff6a00] to-[#00d2ff] flex items-center justify-center">
        <Mic className="w-8 h-8 text-white" />
      </div>
      <p className="text-white/80 text-center">Enter a room code to join an existing jam session</p>
      <div className="flex flex-col gap-3 w-full">
        <Input 
          placeholder="Enter room code" 
          className="h-12 rounded-lg bg-background/80 text-foreground shadow-inner px-5"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <Button 
          className="h-12 rounded-lg bg-gradient-to-r from-[#ff6a00] to-[#ffb347] text-white shadow-lg hover:scale-105 transition-transform"
          onClick={handleJoinRoom}
        >
          Join Room
        </Button>
      </div>
    </div>
  );
} 