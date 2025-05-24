"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Music, Layers, Download, Activity, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AnalyticsClientProps {
  roomsHosted: number;
  loopsRecorded: number;
  sessionsCount: number;
  mixdownsExported: number;
  averageLoopsPerSession: number;
  recentRooms: {
    id: string;
    title: string;
    createdAt: Date;
    bpm: number;
    keySig: string | null;
  }[];
}

export default function AnalyticsClient({
  roomsHosted,
  loopsRecorded,
  sessionsCount,
  mixdownsExported,
  averageLoopsPerSession,
  recentRooms,
}: AnalyticsClientProps) {
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  const handleJoinRoom = () => {
    if (!roomCode) return;
    router.push(`/rooms/join?token=${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Recent Rooms */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl font-bold text-white mb-8">Your Analytics</h1>
            {/* Stats Grid - Make row flex for equal height */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Stat Card 1 */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-md flex-1 h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#006bff] flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg font-semibold">Jam Rooms Hosted</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-bold text-white">{roomsHosted}</p>
                </CardContent>
              </Card>
              {/* Stat Card 2 - Loops Recorded */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-md flex-1 h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#006bff] to-[#00d2ff] flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg font-semibold">Loops Recorded</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-bold text-white">{loopsRecorded}</p>
                </CardContent>
              </Card>
            </div>
            {/* Second row of stats */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-md flex-1 h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6a00] to-[#ffb347] flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg font-semibold">Mixdowns Exported</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-bold text-white">{mixdownsExported}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-md flex-1 h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6a00] to-[#ffb347] flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg font-semibold">Avg. Loops/Session</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-bold text-white">{averageLoopsPerSession.toFixed(1)}</p>
                </CardContent>
              </Card>
            </div>
            {/* Recent Rooms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Jam Rooms</h2>
              <div className="space-y-4">
                {recentRooms.length === 0 ? (
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <p className="text-white/80 text-center">No rooms yet 🎸</p>
                    </CardContent>
                  </Card>
                ) : (
                  recentRooms.map((room) => (
                    <Link
                      key={room.id}
                      href={`/rooms/${room.id}`}
                      className="block"
                    >
                      <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-md hover:bg-white/20 transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-semibold text-white">{room.title}</p>
                              <p className="text-white/80">
                                {room.bpm} BPM
                                {room.keySig ? ` \u2022 ${room.keySig}` : ""}
                              </p>
                            </div>
                            <time
                              dateTime={room.createdAt.toISOString()}
                              className="text-white/60"
                            >
                              {room.createdAt.toLocaleDateString()}
                            </time>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>
          {/* Right Column - Join Session & Quick Stats */}
          <div className="space-y-8">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-md mt-18">
              <CardHeader className="flex flex-col items-center gap-2 pb-2">
                <CardTitle className="text-white text-xl font-semibold">Join a Session</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
            {/* Quick Stats */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-md mt-22.5">
              <CardHeader className="flex flex-col items-center gap-2 pb-2">
                <CardTitle className="text-white text-xl font-semibold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Total Sessions</span>
                    <span className="text-white font-semibold">{sessionsCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Active Rooms</span>
                    <span className="text-white font-semibold">{roomsHosted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Collaborations</span>
                    <span className="text-white font-semibold">{sessionsCount - roomsHosted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 