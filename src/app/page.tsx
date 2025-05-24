"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, Layers, Download, Music } from "lucide-react";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@/components/common/avatar";

export default function LandingPage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#001085] via-[#006bff] to-[#00d2ff] flex flex-col items-center">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#23124d]/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Avatar src="/logo.png" className="h-8 w-8" />
            <span className="text-2xl font-extrabold text-white drop-shadow-lg">SoundBoard</span>
            <span className="ml-2 px-2 py-1 rounded bg-secondary/80 text-secondary-foreground text-xs font-semibold shadow-md backdrop-blur">Collaborative Studio</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {session?.user ? (
              <>
                <span className="text-white font-medium mr-1">{session.user.name}</span>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-400 to-red-500 text-white font-medium hover:from-red-500 hover:to-red-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login?callbackUrl=/analytics">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:scale-105 transition-transform">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" variant="outline" className="ml-2 bg-gradient-to-r from-red-400 to-red-500 border-none text-white hover:from-red-500 hover:to-red-400 hover:text-white">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 w-full px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#00d2ff] via-[#006bff] to-[#001085] bg-clip-text text-transparent drop-shadow-xl">
          Create Music <span className="bg-gradient-to-r from-[#00d2ff] to-[#006bff] bg-clip-text text-transparent">Together</span>
        </h1>
        <p className="text-lg text-white/80 text-center mb-10 max-w-2xl drop-shadow">
          Record loops, layer tracks, and jam with musicians worldwide. No complex software needed.
        </p>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl mb-12">
          {/* Create Jam Room Card */}
          <Card className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-200">
            <CardContent className="flex flex-col items-center py-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#006bff] flex items-center justify-center mb-5 shadow-lg">
                <Music className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Jam Room</h2>
              <p className="text-white/80 mb-6 text-center text-base">Start a new collaborative session and invite musicians to join</p>
              <Link href="/rooms">
                <Button className="w-44 h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:scale-105 transition-transform">Create Room</Button>
              </Link>
            </CardContent>
          </Card>
          {/* Join Session Card */}
          <Card className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-200">
            <CardContent className="flex flex-col items-center py-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ffb347] flex items-center justify-center mb-5 shadow-lg">
                <Layers className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Session</h2>
              <p className="text-white/80 mb-6 text-center text-base">Enter a room code to join an existing jam session</p>
              <div className="flex gap-2 w-full justify-center">
                <Input placeholder="Enter room code" className="w-44 h-12 rounded-full bg-background/80 text-foreground shadow-inner px-5" />
                <Button className="h-12 rounded-full bg-gradient-to-r from-[#ff6a00] to-[#ffb347] text-white shadow-lg hover:scale-105 transition-transform">Join Room</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200">
            <CardContent className="flex flex-col items-center py-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#006bff] flex items-center justify-center mb-4 shadow-md">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Record Loops</h3>
              <p className="text-white/80 text-center text-sm">Capture up to 30-second audio loops with professional quality</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200">
            <CardContent className="flex flex-col items-center py-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#006bff] to-[#00d2ff] flex items-center justify-center mb-4 shadow-md">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Layer Tracks</h3>
              <p className="text-white/80 text-center text-sm">Mix multiple loops with individual volume controls</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200">
            <CardContent className="flex flex-col items-center py-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ffb347] flex items-center justify-center mb-4 shadow-md">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Export Mixdown</h3>
              <p className="text-white/80 text-center text-sm">Download your collaborative creations as audio files</p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full py-6 text-center text-white/60 text-sm mt-12">
        &copy; {new Date().getFullYear()} SoundBoard. Made with ❤️ for collaborative musicians.
      </footer>
    </div>
  );
}
