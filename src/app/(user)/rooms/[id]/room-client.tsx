"use client";
import useSWR from "swr";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InviteModal } from "@/components/invite-modal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Loop {
  id: string;
  url: string;
  createdAt: string; // ISO timestamp
  enabled: boolean;
  volume: number;
  user: {
    id: string;
    name: string;
  };
}

interface RoomClientProps {
  roomId: string;
  userId: string;
  hostId: string;
  code: string;
}

interface RoomMeta {
  isPublic: boolean;
}

export default function RoomClient({
  roomId,
  userId,
  hostId,
  code,
}: RoomClientProps) {
  const { data: loops } = useSWR<Loop[]>(
    `/api/loops?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: false }
  );
  const { data: roomMeta, mutate: mutateRoomMeta } = useSWR<RoomMeta>(
    `/api/rooms/${roomId}`,
    fetcher
  );

  const isHost = hostId === userId;
  const isPublic = roomMeta?.isPublic;

  const toggleRoomPublic = async () => {
    if (!roomMeta) return;
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !roomMeta.isPublic }),
    });
    if (res.ok) mutateRoomMeta({ isPublic: !roomMeta.isPublic }, false);
  };

  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const [settings, setSettings] = useState<
    Record<string, { enabled: boolean; volume: number }>
  >({});
  const [mixing, setMixing] = useState(false);

  useEffect(() => {
    if (!loops) return;
    const updated: Record<string, { enabled: boolean; volume: number }> = {};
    loops.forEach((l) => {
      updated[l.id] = { enabled: l.enabled, volume: l.volume ?? 1.0 };
    });
    setSettings(updated);
  }, [loops]);

  async function startRec() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("file", blob);
      fd.append("roomId", roomId);
      fd.append("name", `Track ${Date.now()}`);
      fd.append("order", String(loops?.length ?? 0));
      await fetch("/api/loops", { method: "POST", body: fd });
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
    setTimeout(() => rec.stop(), 30000);
  }

  function stopRec() {
    recRef.current?.stop();
    setRecording(false);
  }

  const toggleLoop = (id: string) => {
    setSettings((prev) => {
      const enabled = !prev[id].enabled;
      fetch(`/api/loops/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, volume: prev[id].volume }),
      });
      return { ...prev, [id]: { enabled, volume: prev[id].volume } };
    });
  };

  const changeVolume = (id: string, volume: number) => {
    setSettings((prev) => {
      fetch(`/api/loops/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: prev[id].enabled, volume }),
      });
      return { ...prev, [id]: { enabled: prev[id].enabled, volume } };
    });
  };

  const exportMixdown = async () => {
    if (!loops) return;
    const active = loops.filter((l) => settings[l.id]?.enabled);
    if (!active.length) return;

    setMixing(true);
    try {
      const buffers = await Promise.all(
        active.map((l) => fetch(l.url).then((r) => r.arrayBuffer()))
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
        gain.gain.value = settings[active[idx].id]?.volume ?? 1;
        src.connect(gain).connect(offCtx.destination);
        src.start(offsetFrames / sampleRate);
        offsetFrames += audioBuf.length;
      });

      const mixed = await offCtx.startRendering();
      const wavBlob = audioBufferToWav(mixed);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mixdown_${Date.now()}.wav`;
      a.click();

      fetch("/api/mixdowns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, url }),
      });
    } catch (err) {
      console.error("Mixdown failed:", err);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#001085] via-[#006bff] to-[#00d2ff] px-4 py-8">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Jam Session</h2>
            <div className="text-white/70 text-sm">Room Code: <span className="font-mono bg-white/20 px-2 py-1 rounded text-white">{code}</span></div>
            <div className="text-white/60 text-xs mt-1">Host: <span className="font-semibold text-white/80">{hostId}</span></div>
          </div>
          {isHost && roomMeta && (
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-medium">{isPublic ? "Public" : "Private"}</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isPublic} onChange={toggleRoomPublic} className="sr-only" />
                <span className={`w-12 h-6 flex items-center bg-gray-400 rounded-full p-1 duration-300 ease-in-out ${isPublic ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-white/20'}`}> <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${isPublic ? 'translate-x-6' : ''}`}></span> </span>
              </label>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" className="rounded-full px-6 py-3 bg-white/20 border-white/30 text-white font-semibold shadow hover:scale-105 transition-transform" onClick={recording ? stopRec : startRec}>
            {recording ? "Stop Recording" : "Start Recording"}
          </Button>
          <Button disabled={mixing} className="rounded-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-lg hover:scale-105 transition-transform" onClick={exportMixdown}>
            {mixing ? "Mixing…" : "Export Mixdown"}
          </Button>
          {isHost && <InviteModal code={code} />}
        </div>

        {/* Loops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loops?.map((l) => {
            const setting = settings[l.id] || { enabled: true, volume: 1 };
            const time = new Date(l.createdAt).toLocaleString();
            return (
              <div
                key={l.id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white/80">
                      <span className="font-semibold text-white">{l.user.name}</span>
                    </p>
                    <time
                      dateTime={l.createdAt}
                      className="block text-xs text-white/50"
                    >
                      {time}
                    </time>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={() => toggleLoop(l.id)}
                      className="sr-only"
                    />
                    <span className={`w-10 h-5 flex items-center bg-gray-400 rounded-full p-1 duration-300 ease-in-out ${setting.enabled ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-white/20'}`}> <span className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-300 ease-in-out ${setting.enabled ? 'translate-x-5' : ''}`}></span> </span>
                  </label>
                </div>
                <audio
                  src={l.url}
                  controls
                  muted={!setting.enabled}
                  onLoadedMetadata={e => { e.currentTarget.volume = setting.volume; }}
                  className="w-full mt-2 rounded"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-white/60">Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={setting.volume}
                    onChange={(e) => changeVolume(l.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg accent-primary"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
