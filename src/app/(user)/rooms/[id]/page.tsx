"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Mic, Music, Trash2 } from "lucide-react";
import { use } from "react";
import { Loading } from "@/components/common/loading";
import { InviteModal } from "@/components/invite-modal";
import Link from "next/link";

export default function RoomSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: room, isLoading: roomLoading } = useSWR(
    id ? `/api/rooms/${id}` : null,
    (url) => fetch(url).then((r) => r.json())
  );
  const { data: loops, mutate: mutateLoops, isLoading: loopsLoading } = useSWR(
    room?.id ? `/api/loops?roomId=${room.id}` : null,
    (url) => fetch(url).then((r) => r.json()),
    { refreshInterval: 2000 }
  );

  // Recording logic
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(30);
  const recRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loopName, setLoopName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Loop controls
  const [settings, setSettings] = useState<Record<string, { enabled: boolean; volume: number }>>({});
  useEffect(() => {
    if (!loops) return;
    const updated: Record<string, { enabled: boolean; volume: number }> = {};
    loops.forEach((l: any) => {
      updated[l.id] = { enabled: l.enabled, volume: l.volume ?? 1.0 };
    });
    setSettings(updated);
  }, [loops]);

  const deleteLoop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;
    
    try {
      setDeletingId(id);
      const res = await fetch(`/api/loops/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete recording');
      
      mutateLoops();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete recording. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Fix recording timer logic
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordTime((t) => {
          if (t >= 30) return 30;
          return t + 1;
        });
        setRemainingTime((r) => {
          const newTime = r - 1;
          if (newTime <= 0) {
            stopRec();
          }
          return newTime > 0 ? newTime : 0;
        });
      }, 1000);
    } else {
      setRecordTime(0);
      setRemainingTime(30);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recording]);

  // Restore startRec and stopRec
  async function startRec() {
    try {
      if (loops && loops.length >= 4) {
        throw new Error('Maximum number of recordings (4) reached. Please delete some recordings before adding new ones.');
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please try a modern browser like Chrome, Firefox, or Edge.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        setSaving(true);
        const blob = new Blob(chunks, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("file", blob);
        fd.append("roomId", room.id);
        fd.append("name", loopName || `Track ${Date.now()}`);
        fd.append("order", String(loops?.length ?? 0));
        await fetch("/api/loops", { method: "POST", body: fd });
        setSaving(false);
        setLoopName("");
        await mutateLoops(undefined, true); // force re-fetch
        setRecordTime(0);
        setRemainingTime(30);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setRecordTime(0);
      setRemainingTime(30);
    } catch (error: any) {
      console.error('Recording error:', error);
      alert(error.message || 'Failed to start recording. Please check your microphone permissions and try again.');
      setRecording(false);
    }
  }

  function stopRec() {
    recRef.current?.stop();
    setRecording(false);
    setRecordTime(0);
    setRemainingTime(30);
  }

  if (roomLoading || loopsLoading || !room || !session || !session.user || !('id' in session.user)) {
    return <Loading variant="page" text="Loading room..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/rooms" className="flex items-center text-white/80 hover:text-white transition-colors">
            <span className="mr-2">←</span> Leave Room
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-white">{room.title || "Jam Session"}</h1>
          <div className="flex gap-2 mt-2">
            <span className="bg-[#2a0c73] text-white/80 px-3 py-1 rounded-full text-xs font-semibold">Room Code: {room.code}</span>
            <span className="bg-[#006bff] text-white px-3 py-1 rounded-full text-xs font-semibold">BPM: {room.bpm}</span>
            <span className="bg-[#a86a2c] text-white px-3 py-1 rounded-full text-xs font-semibold">Key: {room.keySig}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <Users className="w-5 h-5 mr-1" />
          <span>Collaborators: {typeof room.usersCount === 'number' ? room.usersCount : (room.users && Array.isArray(room.users) ? room.users.length : (session?.user?.id ? 1 : '-'))}</span>
          <div className="ml-2">
            <InviteModal code={room.code} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex gap-8 py-10">
        {/* Left Panel: Record New Loop */}
        <div className="w-80 bg-[#23124d] rounded-2xl p-6 flex flex-col shadow-xl border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-2">Record New Loop</h2>
          <p className="text-white/60 text-sm mb-4">
            {loops && loops.length >= 4 
              ? "Maximum recordings reached (4/4)"
              : `Record up to 30 seconds (${loops?.length || 0}/4 loops)`}
          </p>
          <input
            className="w-full bg-[#1a174d] border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Loop name"
            value={loopName}
            onChange={e => setLoopName(e.target.value)}
            disabled={recording || saving || (loops && loops.length >= 4)}
          />
          <Button
            className="w-full h-11 bg-gradient-to-r from-[#00d2ff] to-[#a259ff] text-white font-bold text-base shadow-lg hover:scale-105 transition-transform mb-2"
            onClick={recording ? stopRec : startRec}
            disabled={saving || (loops && loops.length >= 4)}
          >
            {recording ? "Stop Recording" : (
              <span className="flex items-center justify-center gap-2">
                <Mic className="w-5 h-5" /> 
                {loops && loops.length >= 4 ? "Maximum Recordings Reached" : "Start Recording"}
              </span>
            )}
          </Button>
          {recording && (
            <div className="w-full bg-white/20 rounded-lg h-4 flex items-center px-2 mt-2">
              <div className="bg-gradient-to-r from-[#00d2ff] to-[#a259ff] h-2 rounded transition-all" style={{ width: `${(recordTime/30)*100}%` }} />
              <span className="ml-2 text-xs text-white/80">{remainingTime}s</span>
            </div>
          )}
          {saving && <Loading variant="default" text="Saving..." />}
        </div>

        {/* Track Mixer */}
        <div className="flex-1 bg-[#23124d] rounded-2xl p-8 shadow-xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Music className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Track Mixer</h2>
              <span className="text-white/60 text-sm ml-2">{loops?.length || 0} of 4 loops active</span>
            </div>
          </div>
          <div className="space-y-6">
            {/* Always render from latest loops, sorted by order */}
            {[...(loops ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((track: any) => (
              <div key={track.id} className="bg-[#2d185c] rounded-xl p-5 flex flex-col gap-2 shadow border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-white font-semibold text-base">{track.name || "Untitled"}</div>
                      <div className="text-white/60 text-xs">by {track.user?.name || "-"} • {
                        (track.duration && isFinite(track.duration) && track.duration > 0
                          ? `${Math.round(track.duration)}s`
                          : "-")
                      }</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-red-500/20 hover:bg-red-500/30"
                      onClick={() => deleteLoop(track.id)}
                      disabled={deletingId === track.id}
                    >
                      {deletingId === track.id ? (
                        <Loading variant="button" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-white" />
                      )}
                    </Button>
                  </div>
                </div>
                <audio
                  src={track.url}
                  controls
                  muted={!settings[track.id]?.enabled}
                  onLoadedMetadata={e => {
                    const audio = e.currentTarget;
                    if (!audio || !(audio instanceof HTMLAudioElement)) return;
                    if (settings[track.id]) {
                      audio.volume = settings[track.id].volume ?? 1;
                    }
                  }}
                  className="w-full mt-2 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
