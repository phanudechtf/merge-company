"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Position } from "@/types";

interface DeleteConfirmModalProps {
  open: boolean;
  position: Position | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({
  open,
  position,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmModalProps) {
  if (!open || !position) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">ยืนยันการลบ</h2>
            <p className="text-sm text-slate-500 mt-1">
              ลบตำแหน่ง <span className="font-semibold text-slate-800">{position.name}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">({position.code})</p>
          </div>
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            ยกเลิก
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? "กำลังลบ..." : "ลบตำแหน่ง"}
          </Button>
        </div>
      </div>
    </div>
  );
}
