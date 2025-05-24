'use client';

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import PublicToggle from "@/components/public-toggle";
import { Music, Users, Globe } from "lucide-react";

interface Room {
  id: string;
  title: string;
  createdAt: Date;
  bpm: number;
  keySig: string | null;
  hostId: string;
  isPublic: boolean;
}

interface Props {
  hosted: Room[];
  collaborated: Room[];
  publicRooms: Room[];
}

export default function RoomsClient({ hosted, collaborated, publicRooms }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">Your Jam Rooms</h1>

          <Link href="/rooms/create">
            <button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 rounded-lg shadow-lg font-semibold hover:scale-105 transition-transform">
              Create Room
            </button>
          </Link>
        </div>

        {/* Hosted */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#006bff] flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Hosted by You</h2>
          </div>
          
          {hosted.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <p className="text-white/80 text-center">
                  You haven&apos;t created any rooms yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hosted.map((room) => (
                <Card
                  key={room.id}
                  className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  <Link href={`/rooms/${room.id}`} className="block">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="text-white">{room.title}</span>
                        <time
                          dateTime={room.createdAt.toISOString()}
                          className="text-sm font-normal text-white/60"
                        >
                          {room.createdAt.toLocaleDateString()}
                        </time>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80">
                        {room.bpm} BPM
                        {room.keySig ? ` \u2022 ${room.keySig}` : ""}
                      </p>
                    </CardContent>
                  </Link>
                  <div className="px-6 pb-4">
                    <PublicToggle
                      roomId={room.id}
                      initialIsPublic={room.isPublic}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Collaborating */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#006bff] to-[#00d2ff] flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Collaborating</h2>
          </div>

          {collaborated.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <p className="text-white/80 text-center">
                  Not collaborating in any rooms yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborated.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`}>
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all duration-200">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="text-white">{room.title}</span>
                        <time
                          dateTime={room.createdAt.toISOString()}
                          className="text-sm font-normal text-white/60"
                        >
                          {room.createdAt.toLocaleDateString()}
                        </time>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80">
                        {room.bpm} BPM
                        {room.keySig ? ` \u2022 ${room.keySig}` : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Public Rooms */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ffb347] flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Public Jam Rooms</h2>
          </div>

          {publicRooms.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <p className="text-white/80 text-center">
                  No public rooms available.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicRooms.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`}>
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all duration-200">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="text-white">{room.title}</span>
                        <time
                          dateTime={room.createdAt.toISOString()}
                          className="text-sm font-normal text-white/60"
                        >
                          {room.createdAt.toLocaleDateString()}
                        </time>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80">
                        {room.bpm} BPM
                        {room.keySig ? ` \u2022 ${room.keySig}` : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 