"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvatarCropModalProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
  });
}

async function getCroppedImg(src: string, crop: Area): Promise<string> {
  const img = await createImage(src);
  const size = Math.min(crop.width, crop.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, crop.x, crop.y, size, size, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export function AvatarCropModal({ imageSrc, onCancel, onSave }: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedArea) return;
    setSaving(true);
    const dataUrl = await getCroppedImg(imageSrc, croppedArea);
    onSave(dataUrl);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">ปรับรูปโปรไฟล์</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="relative h-72 bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn size={16} className="text-slate-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-gold-600"
            />
          </div>
          <p className="text-xs text-slate-400 text-center">ลากเพื่อจัดตำแหน่ง · เลื่อนแถบเพื่อซูม</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>ยกเลิก</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกรูป"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
