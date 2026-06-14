"use client";

import { useEffect, useState } from "react";
import { Music, AlertCircle } from "lucide-react";
import { getAudio } from "@/lib/meeting-audio";

interface AudioPlayerProps {
  audioId: string;
  audioName?: string;
}

export function AudioPlayer({ audioId, audioName }: AudioPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;
    getAudio(audioId).then((blob) => {
      if (!active) return;
      if (!blob) { setMissing(true); return; }
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [audioId]);

  if (missing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <AlertCircle size={16} />
        ไฟล์เสียงไม่พบในเครื่องนี้ (เก็บแยกต่อ browser)
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-ivory p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
        <Music size={16} className="text-gold-600" />
        {audioName || "ไฟล์เสียงการประชุม"}
      </div>
      {url ? (
        <audio controls src={url} className="w-full" />
      ) : (
        <div className="h-10 animate-pulse rounded bg-line" />
      )}
    </div>
  );
}
