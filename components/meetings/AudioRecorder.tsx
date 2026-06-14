"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onRecorded: (blob: Blob, mime: string) => void;
}

const NUM_BARS = 9;
const IDLE_LEVELS = Array(NUM_BARS).fill(0.08);

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AudioRecorder({ onRecorded }: AudioRecorderProps) {
  const [state, setState] = useState<"idle" | "requesting" | "recording">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(IDLE_LEVELS);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  function teardownMeter() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevels(IDLE_LEVELS);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      teardownMeter();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function startMeter(stream: MediaStream) {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const usable = Math.floor(analyser.frequencyBinCount * 0.7); // voice low-mid range
    const per = Math.max(1, Math.floor(usable / NUM_BARS));

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const next: number[] = [];
      for (let i = 0; i < NUM_BARS; i++) {
        let sum = 0;
        for (let j = 0; j < per; j++) sum += data[i * per + j] ?? 0;
        next.push(Math.max(0.08, sum / per / 255));
      }
      setLevels(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  async function start() {
    setError(null);
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        onRecorded(blob, type);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setState("recording");
      startMeter(stream);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("เข้าถึงไมโครโฟนไม่ได้ — ตรวจ permission ของ browser");
      setState("idle");
    }
  }

  function stop() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    teardownMeter();
    recorderRef.current?.stop();
    setState("idle");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {state === "recording" ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            <Square size={15} className="fill-white" /> หยุดอัด
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={state === "requesting"}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-ivory disabled:opacity-50"
          >
            {state === "requesting" ? <Loader2 size={15} className="animate-spin" /> : <Mic size={15} className="text-gold-600" />}
            อัดเสียงสด
          </button>
        )}

        {state === "recording" && (
          <div className="flex items-center gap-3">
            {/* live audio meter — bars react to mic input */}
            <div className="flex h-7 items-center gap-[3px]">
              {levels.map((v, i) => (
                <span
                  key={i}
                  style={{ height: `${Math.round(v * 100)}%` }}
                  className="w-1 rounded-full bg-gradient-to-t from-red-500 to-amber-400 transition-[height] duration-75 ease-out"
                />
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              {fmt(seconds)}
            </span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
