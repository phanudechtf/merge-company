"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Calendar, Clock, MapPin, Video, Navigation, Users, Mic, ListChecks, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { mockEmployees } from "@/lib/mock-employees";
import {
  loadMeetings, saveMeetings, MEETING_TEAMS,
  type MeetingRecord,
} from "@/lib/mock-meetings";

function empById(id: string) {
  return mockEmployees.find((e) => e.id === id);
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${day} ${months[m - 1]} ${y + 543}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MeetingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    setMeetings(loadMeetings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveMeetings(meetings);
  }, [meetings, hydrated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meetings
      .filter((m) => (team ? m.team === team : true))
      .filter((m) =>
        q
          ? m.title.toLowerCase().includes(q) ||
            m.team.toLowerCase().includes(q) ||
            m.note.toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [meetings, query, team]);

  function createMeeting() {
    const id = `mtg-${Date.now()}`;
    const rec: MeetingRecord = {
      id,
      title: "การประชุมใหม่",
      date: todayStr(),
      startTime: "09:00",
      endTime: "10:00",
      team: MEETING_TEAMS[0],
      locationType: "onsite",
      locationDetail: "",
      participantIds: [],
      note: "",
      transcript: "",
      actionItems: [],
      createdAt: new Date().toISOString(),
    };
    setMeetings((prev) => [rec, ...prev]);
    router.push(`/meetings/${id}`);
  }

  function confirmDelete(id: string) {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setPendingDelete(null);
    toast("ลบบันทึกการประชุมแล้ว");
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="บันทึกการประชุม" breadcrumbs={["สถานที่", "บันทึกการประชุม"]} />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาหัวข้อ / ทีม / เนื้อหา"
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">ทุกทีม</option>
            {MEETING_TEAMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={createMeeting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white hover:bg-[#2a2a2a]"
          >
            <Plus size={16} /> บันทึกการประชุม
          </button>
        </div>

        {hydrated && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-line bg-white py-16 text-center text-slate-400">
            ไม่พบบันทึกการประชุม
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => {
            const doneCount = m.actionItems.filter((a) => a.done).length;
            const parts = m.participantIds.map(empById).filter(Boolean);
            return (
              <div
                key={m.id}
                onClick={() => router.push(`/meetings/${m.id}`)}
                className="group cursor-pointer rounded-xl border border-line bg-white p-4 shadow-sm transition-all hover:border-gold-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink line-clamp-2 group-hover:text-gold-700">{m.title}</h3>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPendingDelete(m.id); }}
                    className="shrink-0 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Calendar size={13} /> {fmtDate(m.date)}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={13} /> {m.startTime}–{m.endTime}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{m.team}</Badge>
                  <span className="inline-flex items-center gap-1 rounded-full bg-ivory px-2 py-0.5 text-xs text-slate-600">
                    {m.locationType === "online" ? <Video size={12} /> : m.locationType === "offsite" ? <Navigation size={12} /> : <MapPin size={12} />}
                    {m.locationDetail || (m.locationType === "online" ? "Online" : m.locationType === "offsite" ? "นอกสถานที่" : "Onsite")}
                  </span>
                </div>

                {m.note && <p className="mt-3 text-sm text-slate-600 line-clamp-2">{m.note}</p>}

                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <div className="flex -space-x-2">
                    {parts.slice(0, 4).map((e) => (
                      <span
                        key={e!.id}
                        title={e!.fullName}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-gold-500 to-gold-700 text-[10px] font-bold text-white"
                      >
                        {e!.avatarInitials}
                      </span>
                    ))}
                    {parts.length > 4 && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600">
                        +{parts.length - 4}
                      </span>
                    )}
                    {parts.length === 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Users size={13} /> ไม่มีผู้เข้าร่วม</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    {m.audioId && <Mic size={14} className="text-gold-600" />}
                    {m.actionItems.length > 0 && (
                      <span className={cn("inline-flex items-center gap-1", doneCount === m.actionItems.length && "text-emerald-600")}>
                        <ListChecks size={14} /> {doneCount}/{m.actionItems.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPendingDelete(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-ink">ลบบันทึกการประชุม?</h3>
            <p className="mt-1 text-sm text-slate-500">ลบแล้วกู้คืนไม่ได้ (รวมไฟล์เสียงที่แนบ)</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setPendingDelete(null)} className="rounded-lg border border-line px-3 py-2 text-sm hover:bg-ivory">ยกเลิก</button>
              <button onClick={() => confirmDelete(pendingDelete)} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
