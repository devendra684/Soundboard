"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRef, useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Users, Mic, Music, Volume2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Loading } from "@/components/common/loading";
import { InviteModal } from "@/components/invite-modal";

interface Loop {
  id: string;
  name?: string;
  url: string;
  order?: number;
  enabled?: boolean;
  volume?: number;
  duration?: number;
  user?: {
    name?: string;
  };
}

export default function RoomSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: room, isLoading: roomLoading } = useSWR(
    id ? `/api/rooms/${id}` : null,
    (url) => fetch(url).then((r) => r.json())
  );
  const { data: loopsData, mutate: mutateLoops, isLoading: loopsLoading } = useSWR(
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
  const startTimeRef = useRef<number | null>(null);
  const [loopName, setLoopName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Add isMixingMode state
  const [isMixingMode, setIsMixingMode] = useState(false);
  const [panelSelectedIds, setPanelSelectedIds] = useState<string[]>([]);
  const [panelOrder, setPanelOrder] = useState<{ [id: string]: number }>({});

  // Export logic
  const [mixing, setMixing] = useState(false);
  const [mixedDemoUrl, setMixedDemoUrl] = useState<string | null>(null);
  const [mixReady, setMixReady] = useState(false);

  // Add state for mix panel volumes
  const [panelVolumes, setPanelVolumes] = useState<{ [id: string]: number }>({});

  // Add state for mix panel error
  const [panelError, setPanelError] = useState<string | null>(null);

  // Add state for which track's volume popover is open
  const [openVolumePopover, setOpenVolumePopover] = useState<string | null>(null);

  // Add state to store actual audio durations for each track
  const [audioDurations, setAudioDurations] = useState<{ [id: string]: number }>({});

  // Loop controls
  const [settings, setSettings] = useState<Record<string, { enabled: boolean; volume: number }>>({});

  // Update settings when loops change
  useEffect(() => {
    if (!loopsData) return;
    const updated: Record<string, { enabled: boolean; volume: number }> = {};
    loopsData.forEach((l: Loop) => {
      updated[l.id] = { enabled: l.enabled ?? true, volume: l.volume ?? 1.0 };
    });
    setSettings(updated);
  }, [loopsData]);

  const openMixPanel = () => {
    if (!loopsData) return;
    setPanelSelectedIds(loopsData.map((l: Loop) => l.id));
    const orderObj: { [id: string]: number } = {};
    const volumeObj: { [id: string]: number } = {};
    loopsData.forEach((l: Loop, idx: number) => {
      orderObj[l.id] = idx + 1;
      volumeObj[l.id] = settings[l.id]?.volume ?? 1;
    });
    setPanelOrder(orderObj);
    setPanelVolumes(volumeObj);
    setIsMixingMode(true);
  };

  const handlePanelOrderChange = (id: string, value: number) => {
    setPanelOrder((prev) => ({ ...prev, [id]: value }));
  };

  const handlePanelVolumeChange = (id: string, value: number) => {
    setPanelVolumes((prev) => ({ ...prev, [id]: value }));
  };

  const handlePanelConfirm = async () => {
    if (!loopsData) return;
    // Check for duplicate priorities
    const orderValues = Object.values(panelOrder);
    const hasDuplicates = orderValues.length !== new Set(orderValues).size;
    if (hasDuplicates) {
      setPanelError('Each track must have a unique order. Please fix duplicates.');
      return;
    }
    setPanelError(null);
    // Get selected tracks and sort by panelOrder
    const selected = panelSelectedIds
      .map(id => ({ id, order: panelOrder[id] }))
      .sort((a, b) => a.order - b.order)
      .map(({ id }) => loopsData.find((l: Loop) => l.id === id))
      .filter(Boolean);
    if (!selected.length) return;
    setMixing(true);
    setIsMixingMode(false);
    try {
      // Sort selected tracks by user-specified order (panelOrder)
      const sortedSelected = [...selected];
      sortedSelected.sort((a, b) => panelOrder[a.id] - panelOrder[b.id]);
      const buffers = await Promise.all(
        sortedSelected.map((l: Loop) => fetch(l.url).then((r: any) => r.arrayBuffer()))
      );
      const decodeCtx = new AudioContext();
      const decoded: AudioBuffer[] = [];
      for (let i = 0; i < buffers.length; i++) {
        const audioBuf = await decodeCtx.decodeAudioData(buffers[i]);
        decoded.push(audioBuf);
      }
      await decodeCtx.close();
      const sampleRate = decoded[0].sampleRate;
      const numChannels = decoded[0].numberOfChannels;
      const totalLength = decoded.reduce((sum, buf) => sum + buf.length, 0);
      const offCtx = new OfflineAudioContext(
        numChannels,
        totalLength,
        sampleRate
      );
      let offsetFrames = 0;
      decoded.forEach((audioBuf, idx) => {
        const src = offCtx.createBufferSource();
        src.buffer = audioBuf;
        const gain = offCtx.createGain();
        gain.gain.value = panelVolumes[sortedSelected[idx].id] ?? 1;
        src.connect(gain).connect(offCtx.destination);
        src.start(offsetFrames / sampleRate);
        offsetFrames += audioBuf.length;
      });
      const mixed = await offCtx.startRendering();
      const wavBlob = audioBufferToWav(mixed);
      const url = URL.createObjectURL(wavBlob);
      setMixedDemoUrl(url);
      setMixReady(true);
    } catch {
      alert("Could not mix tracks. Please try again.");
    } finally {
      setMixing(false);
    }
  };

  // --- EXPORT BUTTON HANDLER ---
  const exportMixdown = async () => {
    if (!mixedDemoUrl) return;
    setMixing(true);
    try {
      const a = document.createElement("a");
      a.href = mixedDemoUrl;
      a.download = `mixdown_${Date.now()}.wav`;
      a.click();
      fetch("/api/mixdowns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: room.id, url: mixedDemoUrl }),
      });
    } catch {
      alert("Could not export mixdown. Please try again.");
    } finally {
      setMixing(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChan = buffer.numberOfChannels;
    const length = buffer.length * numChan * 2 + 44;
    const arrBuf = new ArrayBuffer(length);
    const view = new DataView(arrBuf);
    const writeStr = (s: string, o: number) => {
      for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
    };
    writeStr("RIFF", 0);
    view.setUint32(4, length - 8, true);
    writeStr("WAVEfmt ", 8);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChan, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numChan * 2, true);
    view.setUint16(32, numChan * 2, true);
    view.setUint16(34, 16, true);
    writeStr("data", 36);
    view.setUint32(40, length - 44, true);
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChan; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }
    return new Blob([view], { type: "audio/wav" });
  };

  const deleteLoop = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/loops/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.log('Delete response:', data);
        throw new Error(data.error || 'Failed to delete recording');
      }
      
      await mutateLoops();
    } catch (error: any) {
      console.error('Delete error:', error);
      console.log('Error details:', error.message);
      alert(error.message || 'Failed to delete recording. Please try again.');
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
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
      if (loopsData && loopsData.length >= 4) {
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
        // Calculate duration from start time
        const endTime = Date.now();
        const duration = startTimeRef.current ? (endTime - startTimeRef.current) / 1000 : recordTime;
        
        const fd = new FormData();
        fd.append("file", blob);
        fd.append("roomId", room.id);
        fd.append("name", loopName || `Track ${Date.now()}`);
        fd.append("order", String(loopsData?.length ?? 0));
        fd.append("duration", String(duration));
        await fetch("/api/loops", { method: "POST", body: fd });
        setSaving(false);
        setLoopName("");
        await mutateLoops(undefined, true); // force re-fetch
        setRecordTime(0);
        setRemainingTime(30);
      };
      recRef.current = rec;
      rec.start();
      startTimeRef.current = Date.now();
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

  // Add this skeleton loader component above the main export
  function TrackListSkeleton() {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#2d185c] rounded-xl p-5 flex flex-col gap-2 shadow border border-white/10 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div>
                  <div className="h-4 w-32 bg-white/20 rounded mb-2" />
                  <div className="h-3 w-20 bg-white/10 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-white/10 rounded-full" />
              </div>
            </div>
            <div className="h-10 w-full bg-white/10 rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  // Custom Delete Confirmation Modal
  function DeleteConfirmModal({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#23124d] border border-white/20 rounded-2xl p-8 shadow-xl w-full max-w-sm mx-auto">
          <div className="text-lg font-bold text-white mb-4">Delete Recording?</div>
          <div className="text-white/80 mb-6">Are you sure you want to delete this recording?</div>
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 rounded bg-white/10 text-white/80 hover:bg-white/20 font-semibold">Cancel</button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 flex items-center justify-center min-w-[80px]"
              disabled={!!deletingId}
            >
              {deletingId === pendingDeleteId ? <Loading variant="button" /> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // if (roomLoading || !room || !session || !session.user) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-[#1a0850] via-[#2a0c73] to-[#1e1a4b]">
  //       <Loading variant="overlay" text="Loading room..." />
  //     </div>
  //   );
  // }
  if (roomLoading || !room || !session || !session.user) {
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
          <span>Collaborators: {typeof room.usersCount === 'number' ? room.usersCount : (room.users && Array.isArray(room.users) ? room.users.length : (session?.user ? 1 : '-'))}</span>
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
            {loopsData && loopsData.length >= 4 
              ? "Maximum recordings reached (4/4)"
              : `Record up to 30 seconds (${loopsData?.length || 0}/4 loops)`}
          </p>
          <input
            className="w-full bg-[#1a174d] border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Loop name"
            value={loopName}
            onChange={e => setLoopName(e.target.value)}
            disabled={recording || saving || (loopsData && loopsData.length >= 4)}
          />
          <Button
            className="w-full h-11 bg-gradient-to-r from-[#00d2ff] to-[#a259ff] text-white font-bold text-base shadow-lg hover:scale-105 transition-transform mb-2"
            onClick={recording ? stopRec : startRec}
            disabled={saving || (loopsData && loopsData.length >= 4)}
          >
            {recording ? "Stop Recording" : (
              <span className="flex items-center justify-center gap-2">
                <Mic className="w-5 h-5" /> 
                {loopsData && loopsData.length >= 4 ? "Maximum Recordings Reached" : "Start Recording"}
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
          {mixing && <Loading variant="overlay" text="Mixing tracks..." />}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Music className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Track Mixer</h2>
              <span className="text-white/60 text-sm ml-2">{loopsData?.length || 0} of 4 loops active</span>
            </div>
            <div className="flex gap-2">
              <Button 
                className="bg-gradient-to-r from-[#00d2ff] to-[#a259ff] text-white font-bold shadow-lg hover:scale-105 transition-transform w-40"
                onClick={openMixPanel} 
                disabled={mixing}
              >
                {mixing ? <Loading variant="button" text="Mixing..." /> : "Mix Tracks"}
              </Button>
            </div>
          </div>
          {/* Inline Mix Panel */}
          {isMixingMode && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="relative bg-[#23124d] rounded-2xl p-8 shadow-xl border border-white/10 w-full max-w-2xl mx-auto mt-16">
                <div className="text-xl font-bold text-white mb-4">Select Tracks & Order for Mixing</div>
                <div className="space-y-4">
                  {loopsData && loopsData.map((track: Loop, idx: number) => (
                    panelSelectedIds.includes(track.id) && (
                      <div key={track.id} className="flex flex-col gap-2 bg-[#2d185c] rounded-lg p-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-white font-semibold">{track.name || `Track ${idx + 1}`}</div>
                            <div className="text-white/60 text-xs">by {track.user?.name || "-"} • {
                              audioDurations[track.id] !== undefined && isFinite(audioDurations[track.id]) && audioDurations[track.id] > 0
                                ? `${audioDurations[track.id]}s`
                                : (track.duration && isFinite(track.duration) && track.duration > 0
                                    ? `${Math.round(track.duration)}s`
                                    : "-")
                            }</div>
                          </div>
                          <select
                            value={panelOrder[track.id]}
                            onChange={e => handlePanelOrderChange(track.id, Number(e.target.value))}
                            className="bg-[#1a174d] text-white rounded px-2 py-1 border border-white/20"
                          >
                            {Array.from({ length: panelSelectedIds.length }, (_, i) => i + 1).map((n) => (
                              <option
                                key={n}
                                value={n}
                              >
                                {n}
                              </option>
                            ))}
                          </select>
                          {/* Volume icon and popover */}
                          <div className="relative flex items-center ml-4">
                            <button
                              type="button"
                              className="focus:outline-none"
                              onClick={() => setOpenVolumePopover(openVolumePopover === track.id ? null : track.id)}
                            >
                              <Volume2 className="w-6 h-6 text-cyan-400 hover:text-cyan-300 transition" />
                            </button>
                            <span className="text-cyan-300 text-xs font-semibold ml-2 w-10 text-right">{Math.round((panelVolumes[track.id] ?? 1) * 100)}%</span>
                            {openVolumePopover === track.id && (
                              <div className="absolute left-1/2 -translate-x-1/2 top-8 z-50 flex flex-col items-center bg-[#1a174d] border border-cyan-400 rounded-lg p-3 shadow-xl" style={{ minWidth: 120 }}>
                                <input
                                  type="range"
                                  min={0}
                                  max={1}
                                  step={0.01}
                                  value={panelVolumes[track.id] ?? 1}
                                  onChange={e => handlePanelVolumeChange(track.id, parseFloat(e.target.value))}
                                  className="accent-[#00d2ff] w-32 h-2"
                                />
                                <span className="text-cyan-300 text-xs font-semibold mt-1">{Math.round((panelVolumes[track.id] ?? 1) * 100)}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
                {panelError && (
                  <div className="text-red-400 font-semibold text-sm mt-4 mb-2 text-center">{panelError}</div>
                )}
                <div className="flex justify-end gap-2 mt-6">
                  <Button onClick={() => { setIsMixingMode(false); setPanelError(null); }} className="border border-white/30 text-white/80 bg-transparent hover:bg-white/10 font-semibold">Cancel</Button>
                  <Button onClick={handlePanelConfirm} disabled={panelSelectedIds.length < 1} className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">Confirm & Mix</Button>
                </div>
              </div>
            </div>
          )}
          {/* Demo Player */}
          {mixedDemoUrl && (
            <div className="mb-6 flex items-center gap-4 bg-gradient-to-r from-[#00d2ff] to-[#a259ff] border-2 border-[#00d2ff] rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 flex-1">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-waveform"><path d="M3 12v2"/><path d="M7 8v8"/><path d="M11 4v16"/><path d="M15 8v8"/><path d="M19 12v2"/></svg>
                <div className="flex flex-col flex-1">
                  <span className="text-white font-bold text-base mb-1">Preview Mix</span>
                  <span className="text-white/80 text-xs mb-2">Preview your final mix before exporting</span>
                  <audio src={mixedDemoUrl} controls className="w-full max-w-md rounded" />
                </div>
              </div>
              <Button 
                className="bg-[#ff3b3b] text-white hover:bg-[#ff5c5c] font-semibold ml-4 h-12 px-6 text-base shadow-lg"
                onClick={exportMixdown} 
                disabled={mixing || !mixReady}
              >
                {mixing ? <Loading variant="button" text="Exporting..." /> : "Export"}
              </Button>
            </div>
          )}
          {/* Track List or Skeleton */}
          {loopsLoading ? (
            <div className="relative">
              <Loading variant="overlay" text="Loading tracks..." />
              <TrackListSkeleton />
            </div>
          ) : (
            <div className="space-y-6">
              {[...(loopsData ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((track: Loop) => (
                <div key={track.id} className="bg-[#2d185c] rounded-xl p-5 flex flex-col gap-2 shadow border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-white font-semibold text-base">{track.name || "Untitled"}</div>
                        <div className="text-white/60 text-xs">by {track.user?.name || "-"} • {
                          audioDurations[track.id] !== undefined && isFinite(audioDurations[track.id]) && audioDurations[track.id] > 0
                            ? `${audioDurations[track.id]}s`
                            : (track.duration && isFinite(track.duration) && track.duration > 0
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
                        onClick={() => setPendingDeleteId(track.id)}
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
                      if (isFinite(audio.duration) && audio.duration > 0) {
                        setAudioDurations(prev => ({ ...prev, [track.id]: Math.round(audio.duration) }));
                      }
                    }}
                    className="w-full mt-2 rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={!!pendingDeleteId}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteId && deleteLoop(pendingDeleteId)}
      />
    </div>
  );
}