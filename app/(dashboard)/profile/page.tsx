"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera, Mail, Phone, Building2, Briefcase, Calendar, MapPin, Trash2,
  ClipboardList, AtSign, Megaphone, ChevronRight, CheckCheck, Inbox, Clock,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useProfile } from "@/components/layout/ProfileContext";
import { useNotifications } from "@/components/layout/NotificationContext";
import { AvatarCropModal } from "@/components/hr/AvatarCropModal";
import { mockEmployees } from "@/lib/mock-employees";
import type { MyNotification, MyNotiKind } from "@/lib/my-notifications";
import { cn } from "@/lib/utils";

const kindStyle: Record<MyNotiKind, { icon: React.ReactNode; bg: string; label: string }> = {
  assignment:   { icon: <ClipboardList size={15} />, bg: "bg-gold-100 text-gold-600",   label: "สั่งงาน" },
  mention:      { icon: <AtSign size={15} />,         bg: "bg-blue-100 text-blue-600",   label: "กล่าวถึง" },
  announcement: { icon: <Megaphone size={15} />,      bg: "bg-amber-100 text-amber-600", label: "ประกาศ" },
};

const statusLabel: Record<string, { label: string; cls: string }> = {
  backlog:     { label: "Backlog",   cls: "bg-slate-100 text-slate-600" },
  in_progress: { label: "กำลังทำ",   cls: "bg-gold-100 text-gold-700" },
  done:        { label: "เสร็จสิ้น", cls: "bg-emerald-100 text-emerald-700" },
  cancelled:   { label: "ยกเลิก",    cls: "bg-slate-100 text-slate-500" },
};

const priorityLabel: Record<string, { label: string; cls: string }> = {
  urgent: { label: "ด่วนมาก", cls: "bg-red-100 text-red-700" },
  high:   { label: "ด่วน",    cls: "bg-orange-100 text-orange-700" },
  medium: { label: "ปกติ",    cls: "bg-slate-100 text-slate-600" },
  low:    { label: "ต่ำ",     cls: "bg-slate-100 text-slate-500" },
};

function thaiDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

function thaiDayMonth(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(iso));
}

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { currentUserId, name, role, initials, avatarUrl, setAvatarUrl } = useProfile();
  const { notifications, unreadCount, isRead, markRead, markAllRead } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const me = mockEmployees.find((e) => e.id === currentUserId)!;
  const profileInfo = [
    { label: "อีเมล", value: me.email, icon: <Mail size={15} /> },
    { label: "เบอร์โทร", value: me.phone, icon: <Phone size={15} /> },
    { label: "แผนก", value: me.departmentName, icon: <Building2 size={15} /> },
    { label: "ตำแหน่ง", value: me.positionName, icon: <Briefcase size={15} /> },
    { label: "สาขา", value: me.branchName, icon: <MapPin size={15} /> },
    { label: "เริ่มงาน", value: thaiDate(me.startDate), icon: <Calendar size={15} /> },
  ];

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("กรุณาเลือกไฟล์รูปภาพ", "error"); return; }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropSave = (dataUrl: string) => {
    setAvatarUrl(dataUrl);
    setCropSrc(null);
    toast("เปลี่ยนรูปโปรไฟล์แล้ว");
  };

  const openNoti = (n: MyNotification) => {
    markRead(n.id);
    router.push(n.href);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="โปรไฟล์" breadcrumbs={["โปรไฟล์"]} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-gold-500 via-gold-600 to-blue-500" />
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                {/* Avatar + change */}
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gold-600 border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-gold-600 text-white flex items-center justify-center shadow-md hover:bg-gold-700 transition-colors"
                    title="เปลี่ยนรูป"
                  >
                    <Camera size={15} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
                </div>

                <div className="flex-1 sm:pb-1">
                  <h1 className="text-xl font-bold text-slate-900">{name}</h1>
                  <p className="text-sm text-slate-500">{role} · SENSE ASIA CORPORATION</p>
                </div>

                <div className="flex gap-2 sm:pb-1">
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Camera size={14} /> เปลี่ยนรูป
                  </Button>
                  {avatarUrl && (
                    <Button variant="outline" size="sm" onClick={() => { setAvatarUrl(null); toast("ลบรูปโปรไฟล์แล้ว", "info"); }}>
                      <Trash2 size={14} /> ลบรูป
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* กิจกรรมถึงฉัน */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">กิจกรรมถึงฉัน</h2>
                {unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount} ใหม่
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => { markAllRead(); toast("อ่านทั้งหมดแล้ว", "info"); }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-gold-600 transition-colors"
                >
                  <CheckCheck size={14} /> อ่านทั้งหมด
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Inbox size={32} className="mb-2" />
                <p className="text-sm">ยังไม่มีกิจกรรมถึงคุณ</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((n) => {
                  const unread = !isRead(n.id);
                  const st = kindStyle[n.kind];
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => openNoti(n)}
                        className={cn(
                          "flex items-start gap-3 w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors",
                          unread && "bg-gold-50/40"
                        )}
                      >
                        <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", st.bg)}>
                          {st.icon}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("text-sm", unread ? "font-semibold text-slate-900" : "text-slate-600")}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400">· {st.label}</span>
                          </div>

                          {n.detail && (
                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.detail}</p>
                          )}

                          {/* meta row */}
                          <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            {n.meta?.code && (
                              <span className="text-[10px] font-medium text-slate-400">{n.meta.code}</span>
                            )}
                            {n.meta?.priority && priorityLabel[n.meta.priority] && (
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", priorityLabel[n.meta.priority].cls)}>
                                {priorityLabel[n.meta.priority].label}
                              </span>
                            )}
                            {n.meta?.status && statusLabel[n.meta.status] && (
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", statusLabel[n.meta.status].cls)}>
                                {statusLabel[n.meta.status].label}
                              </span>
                            )}
                            {n.meta?.due && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Clock size={10} /> ครบกำหนด {thaiDayMonth(n.meta.due)}
                              </span>
                            )}
                            {n.meta?.assignees && (
                              <span className="text-[10px] text-slate-400">มอบหมาย: {n.meta.assignees}</span>
                            )}
                            {n.meta?.audience && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                {n.meta.audience}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                          {unread ? (
                            <span className="w-2 h-2 rounded-full bg-gold-500" />
                          ) : (
                            <ChevronRight size={14} className="text-slate-300" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">ข้อมูลส่วนตัว</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profileInfo.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0")}>
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">{f.label}</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {cropSrc && (
        <AvatarCropModal imageSrc={cropSrc} onCancel={() => setCropSrc(null)} onSave={handleCropSave} />
      )}
    </div>
  );
}
