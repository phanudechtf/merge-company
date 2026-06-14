"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, Trash2, X, UserPlus, FileText, AlignLeft, ListChecks, Video, MapPin,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { mockEmployees } from "@/lib/mock-employees";
import { AudioPlayer } from "@/components/meetings/AudioPlayer";
import { AudioRecorder } from "@/components/meetings/AudioRecorder";
import { ActionItems } from "@/components/meetings/ActionItems";
import { putAudio, deleteAudio } from "@/lib/meeting-audio";
import {
  loadMeetings, saveMeetings, MEETING_TEAMS,
  type MeetingRecord, type ActionItem,
} from "@/lib/mock-meetings";
import { meetingRooms } from "@/lib/mock-meeting-rooms";

const fieldClass =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold-500";

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
      {icon} {children}
    </h2>
  );
}

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [rec, setRec] = useState<MeetingRecord | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const found = loadMeetings().find((m) => m.id === params.id) ?? null;
    setRec(found);
    setHydrated(true);
  }, [params.id]);

  function persist(next: MeetingRecord) {
    const list = loadMeetings();
    const idx = list.findIndex((m) => m.id === next.id);
    if (idx >= 0) list[idx] = next;
    saveMeetings(list);
  }

  function update(patch: Partial<MeetingRecord>) {
    setRec((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !rec) return;
    const audioId = `${rec.id}-audio`;
    await putAudio(audioId, file);
    update({ audioId, audioName: file.name, audioMime: file.type });
    toast("แนบไฟล์เสียงแล้ว");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onRecorded(blob: Blob, mime: string) {
    if (!rec) return;
    const audioId = `${rec.id}-audio`;
    await putAudio(audioId, blob);
    const ext = mime.includes("webm") ? "webm" : "audio";
    update({ audioId, audioName: `บันทึกสด.${ext}`, audioMime: mime });
    toast("บันทึกเสียงแล้ว");
  }

  async function removeAudio() {
    if (!rec?.audioId) return;
    await deleteAudio(rec.audioId);
    update({ audioId: undefined, audioName: undefined, audioMime: undefined });
    toast("ลบไฟล์เสียงแล้ว");
  }

  function addParticipant(id: string) {
    if (!id || !rec || rec.participantIds.includes(id)) return;
    update({ participantIds: [...rec.participantIds, id] });
  }

  function removeParticipant(id: string) {
    if (!rec) return;
    update({ participantIds: rec.participantIds.filter((p) => p !== id) });
  }

  if (hydrated && !rec) {
    return (
      <div className="flex flex-col h-full">
        <Header title="บันทึกการประชุม" breadcrumbs={["สถานที่", "บันทึกการประชุม"]} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-400">
          ไม่พบบันทึกการประชุมนี้
          <button onClick={() => router.push("/meetings")} className="rounded-lg border border-line px-4 py-2 text-sm text-ink hover:bg-ivory">
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  if (!rec) return <div className="flex flex-col h-full"><Header title="บันทึกการประชุม" /></div>;

  const available = mockEmployees.filter((e) => !rec.participantIds.includes(e.id));

  return (
    <div className="flex flex-col h-full">
      <Header title="บันทึกการประชุม" breadcrumbs={["สถานที่", "บันทึกการประชุม", rec.title]} />

      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => router.push("/meetings")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ink"
        >
          <ArrowLeft size={16} /> รายการประชุม
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: basic info + audio */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-line bg-white p-4">
              <input
                value={rec.title}
                onChange={(e) => update({ title: e.target.value })}
                className="mb-3 w-full border-b border-transparent text-lg font-semibold text-ink focus:border-gold-400 focus:outline-none"
                placeholder="หัวข้อการประชุม"
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-500">วันที่
                  <input type="date" value={rec.date} onChange={(e) => update({ date: e.target.value })} className={cn(fieldClass, "mt-1")} />
                </label>
                <label className="text-xs text-slate-500">ทีม / แผนก
                  <select value={rec.team} onChange={(e) => update({ team: e.target.value })} className={cn(fieldClass, "mt-1")}>
                    {MEETING_TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-500">เริ่ม
                  <input type="time" value={rec.startTime} onChange={(e) => update({ startTime: e.target.value })} className={cn(fieldClass, "mt-1")} />
                </label>
                <label className="text-xs text-slate-500">สิ้นสุด
                  <input type="time" value={rec.endTime} onChange={(e) => update({ endTime: e.target.value })} className={cn(fieldClass, "mt-1")} />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-500">รูปแบบ
                  <select value={rec.locationType} onChange={(e) => update({ locationType: e.target.value as MeetingRecord["locationType"], locationDetail: "" })} className={cn(fieldClass, "mt-1")}>
                    <option value="onsite">Onsite (ห้องประชุม)</option>
                    <option value="offsite">นอกสถานที่</option>
                    <option value="online">Online</option>
                  </select>
                </label>
                <label className="text-xs text-slate-500">{rec.locationType === "online" ? "ลิงก์ประชุม" : rec.locationType === "offsite" ? "สถานที่" : "ห้องประชุม"}
                  {rec.locationType === "onsite" ? (
                    <select value={rec.locationDetail} onChange={(e) => update({ locationDetail: e.target.value })} className={cn(fieldClass, "mt-1")}>
                      <option value="">— เลือกห้องประชุม —</option>
                      {meetingRooms.map((r) => (
                        <option key={r.id} value={r.name}>{r.name} · {r.floor} ({r.capacity} ที่นั่ง)</option>
                      ))}
                    </select>
                  ) : (
                    <input value={rec.locationDetail} onChange={(e) => update({ locationDetail: e.target.value })} placeholder={rec.locationType === "online" ? "Zoom / Meet" : "เช่น ร้านกาแฟ / ออฟฟิศลูกค้า"} className={cn(fieldClass, "mt-1")} />
                  )}
                </label>
              </div>
            </div>

            {/* Participants */}
            <div className="rounded-xl border border-line bg-white p-4">
              <SectionTitle icon={<UserPlus size={15} />}>ผู้เข้าร่วม</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {rec.participantIds.map((id) => {
                  const e = mockEmployees.find((x) => x.id === id);
                  if (!e) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-ivory py-1 pl-1 pr-2 text-sm text-ink">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-gold-700 text-[10px] font-bold text-white">{e.avatarInitials}</span>
                      {e.fullName}
                      <button onClick={() => removeParticipant(id)} className="text-slate-400 hover:text-red-500"><X size={13} /></button>
                    </span>
                  );
                })}
                {rec.participantIds.length === 0 && <span className="text-sm text-slate-400">ยังไม่มีผู้เข้าร่วม</span>}
              </div>
              <select value="" onChange={(e) => addParticipant(e.target.value)} className={cn(fieldClass, "mt-3")}>
                <option value="">+ เพิ่มผู้เข้าร่วม</option>
                {available.map((e) => <option key={e.id} value={e.id}>{e.fullName} · {e.positionName}</option>)}
              </select>
            </div>

            {/* Audio */}
            <div className="rounded-xl border border-line bg-white p-4">
              <SectionTitle icon={rec.locationType === "online" ? <Video size={15} /> : <MapPin size={15} />}>ไฟล์เสียง</SectionTitle>
              {rec.audioId ? (
                <div className="space-y-2">
                  <AudioPlayer audioId={rec.audioId} audioName={rec.audioName} />
                  <button onClick={removeAudio} className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600">
                    <Trash2 size={14} /> ลบไฟล์เสียง
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-ivory px-3 py-3 text-sm text-slate-600 hover:border-gold-400"
                  >
                    <Upload size={16} /> อัปโหลดไฟล์เสียง (mp3 / m4a / wav)
                  </button>
                  <input ref={fileRef} type="file" accept="audio/*" onChange={onUpload} className="hidden" />
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-px flex-1 bg-line" /> หรือ <span className="h-px flex-1 bg-line" />
                  </div>
                  <AudioRecorder onRecorded={onRecorded} />
                </div>
              )}
            </div>
          </div>

          {/* Right: note, transcript, action items */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-line bg-white p-4">
              <SectionTitle icon={<AlignLeft size={15} />}>บันทึกย่อ / สรุป</SectionTitle>
              <textarea
                value={rec.note}
                onChange={(e) => update({ note: e.target.value })}
                rows={6}
                placeholder="สรุปประเด็นสำคัญ มติที่ประชุม..."
                className="w-full resize-y rounded-lg border border-line bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="rounded-xl border border-line bg-white p-4">
              <SectionTitle icon={<FileText size={15} />}>Transcript</SectionTitle>
              <textarea
                value={rec.transcript}
                onChange={(e) => update({ transcript: e.target.value })}
                rows={8}
                placeholder="วาง/พิมพ์ถอดเสียงการประชุมที่นี่"
                className="w-full resize-y rounded-lg border border-line bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="rounded-xl border border-line bg-white p-4">
              <SectionTitle icon={<ListChecks size={15} />}>Action Items</SectionTitle>
              <ActionItems items={rec.actionItems} onChange={(items: ActionItem[]) => update({ actionItems: items })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
