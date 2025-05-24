"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Listbox } from '@headlessui/react';
import { createPortal } from 'react-dom';
import { Fragment } from 'react';

const BPM_OPTIONS = Array.from({ length: 201 }, (_, i) => 40 + i); // 40-240
const KEY_OPTIONS = [
  "C Major", "G Major", "D Major", "A Major", "E Major", "B Major", "F# Major", "C# Major",
  "F Major", "Bb Major", "Eb Major", "Ab Major", "Db Major", "Gb Major", "Cb Major",
  "A Minor", "E Minor", "B Minor", "F# Minor", "C# Minor", "G# Minor", "D# Minor", "A# Minor",
  "D Minor", "G Minor", "C Minor", "F Minor", "Bb Minor", "Eb Minor", "Ab Minor"
];

export default function CreateRoomPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState(120);
  const [keySig, setKeySig] = useState("C Major");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/rooms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, bpm, keySig, isPublic }),
    }).then((r) => r.json());
    router.push(`/rooms/${res.id}`);
  }

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  from-[#001085] via-[#006bff] to-[#00d2ff] px-2 py-8">
      <div className="w-full max-w-5xl mx-4 md:mx-auto bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl flex flex-row items-stretch p-0" style={{ minHeight: '470px' }}>
        {/* Left Side: Icon, Title, Subtitle */}
        <div className="w-1/2 flex flex-col items-center rounded-2xl justify-center bg-gradient-to-br from-[#00d2ff] to-[#006bff] p-12">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6 shadow-lg">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Create Jam Room</h1>
          <p className="text-white/80 text-center text-lg">Set up your collaborative music session</p>
        </div>
        {/* Right Side: Form */}
        <div className="w-1/2 flex flex-col justify-center p-8 md:p-12 h-full relative">
          <Link href="/rooms" className="flex items-center text-white/80 hover:text-white transition-colors absolute top-4 right-4 z-10">
            <span className="mr-2">←</span> Back to Home
          </Link>
          <form onSubmit={handleSubmit} className="flex flex-col justify-center flex-1 w-full space-y-8 mt-8">
            <div className="flex flex-col md:flex-row w-full gap-4 items-stretch">
              <div className="flex-1 w-full">
                <label className="block text-white/90 font-semibold mb-1">Room Title</label>
                <input
                  className="w-full bg-[#1a174d]/80 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter room title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={{ minWidth: 0 }}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="block text-white/90 font-semibold mb-1">BPM</label>
                <Listbox value={bpm} onChange={setBpm}>
                  <div className="relative">
                    <Listbox.Button tabIndex={-1} className="w-full bg-[#1a174d]/80 border border-white/20 rounded-lg px-4 py-3 text-white text-left focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                      {bpm} BPM
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-lg bg-[#1a174d] border border-white/20 py-1 shadow-xl">
                      {BPM_OPTIONS.map(opt => (
                        <Listbox.Option
                          key={opt}
                          value={opt}
                          className={({ active, selected }) =>
                            `cursor-pointer select-none px-4 py-2 text-white ${active ? 'bg-[#2a0c73]' : ''} ${selected ? 'font-bold bg-[#006bff]/30' : ''}`
                          }
                        >
                          {opt} BPM
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div className="flex-1">
                <label className="block text-white/90 font-semibold mb-1">Key Signature</label>
                <Listbox value={keySig} onChange={setKeySig}>
                  <div className="relative">
                    <Listbox.Button tabIndex={-1} className="w-full bg-[#1a174d]/80 border border-white/20 rounded-lg px-4 py-3 text-white text-left focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                      {keySig}
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-lg bg-[#1a174d] border border-white/20 py-1 shadow-xl">
                      {KEY_OPTIONS.map(opt => (
                        <Listbox.Option
                          key={opt}
                          value={opt}
                          className={({ active, selected }) =>
                            `cursor-pointer select-none px-4 py-2 text-white ${active ? 'bg-[#2a0c73]' : ''} ${selected ? 'font-bold bg-[#006bff]/30' : ''}`
                          }
                        >
                          {opt}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>
            <div className="flex items-center justify-between w-full mt-2 mb-6">
              <span className="text-white/90 font-semibold">Want to make the room public</span>
              <button
                type="button"
                aria-pressed={isPublic}
                onClick={() => setIsPublic(v => !v)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none border-2 ${
                  isPublic
                    ? 'bg-gradient-to-r from-[#00d2ff] to-[#006bff] border-blue-400'
                    : 'bg-white/20 border-white/20'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                    isPublic ? 'translate-x-7' : 'translate-x-1'
                  }`}
                >
                  {isPublic && (
                    <svg className="w-4 h-4 mx-auto my-auto text-blue-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
            <Button
              type="submit"
              className="w-full h-14 rounded-lg bg-gradient-to-r from-[#00d2ff] to-[#006bff] text-white font-bold text-lg shadow-lg hover:brightness-110 transition-all text-xl"
              disabled={loading}
              style={{ minWidth: 0 }}
            >
              {loading ? "Creating…" : "Create Room"}
            </Button>
          </form>
        </div>
      </div>
    // </div>
  );
} 