"use client";

import { useMemo, useState } from "react";
import { DoorOpen, Users, CalendarCheck, Clock, X, Trash2, Plus, MapPin, Pencil, CalendarPlus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { mockEmployees } from "@/lib/mock-employees";
import {
  meetingRooms, seedBookings, roomColorMap, roomColorCycle,
  BOOKING_START_HOUR, BOOKING_END_HOUR,
  type RoomBooking, type MeetingRoom,
} from "@/lib/mock-meeting-rooms";

const HOURS = Array.from({ length: BOOKING_END_HOUR - BOOKING_START_HOUR }, (_, i) => BOOKING_START_HOUR + i);

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const selectClass =
  "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

interface BookingDraft {
  room: MeetingRoom;
  startHour: number;
}

interface RoomForm {
  name: string;
  capacity: string;
  floor: string;
  amenities: string;
}

const emptyRoomForm: RoomForm = { name: "", capacity: "8", floor: "", amenities: "" };

export default function MeetingRoomsPage() {
  const toast = useToast();
  const [today] = useState(todayStr);
  const [selectedDate, setSelectedDate] = useState(today);
  const [rooms, setRooms] = useState<MeetingRoom[]>(meetingRooms);
  const [bookings, setBookings] = useState<RoomBooking[]>(() => seedBookings(today));

  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [form, setForm] = useState({ title: "", bookedById: "", startHour: BOOKING_START_HOUR, endHour: BOOKING_START_HOUR + 1 });

  // Room CRUD
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState<RoomForm>(emptyRoomForm);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === selectedDate),
    [bookings, selectedDate]
  );

  const nowHour = new Date().getHours();
  const isToday = selectedDate === today;

  const stats = useMemo(() => {
    const busyNow = isToday
      ? new Set(dayBookings.filter((b) => nowHour >= b.startHour && nowHour < b.endHour).map((b) => b.roomId))
      : new Set<string>();
    return {
      totalRooms: rooms.length,
      freeNow: rooms.length - busyNow.size,
      bookingsToday: dayBookings.length,
    };
  }, [dayBookings, isToday, nowHour, rooms]);

  // ชั่วโมงที่ถูกจองแล้วของห้องในวันที่เลือก
  const getBookedHours = (roomId: string) => {
    const s = new Set<number>();
    dayBookings.filter((b) => b.roomId === roomId).forEach((b) => {
      for (let h = b.startHour; h < b.endHour; h++) s.add(h);
    });
    return s;
  };

  const openBooking = (room: MeetingRoom, requestedStart: number) => {
    const booked = getBookedHours(room.id);
    const starts = HOURS.filter((h) => !booked.has(h));
    if (starts.length === 0) { toast(`${room.name} ถูกจองเต็มแล้ว`, "error"); return; }
    const start = starts.find((h) => h >= requestedStart) ?? starts[0];
    const nextBooked = [...booked].filter((h) => h > start).sort((a, b) => a - b)[0] ?? BOOKING_END_HOUR;
    setDraft({ room, startHour: start });
    setForm({ title: "", bookedById: "", startHour: start, endHour: Math.min(start + 1, nextBooked) });
  };

  // booking จากปุ่มบน card — เริ่มที่ช่องว่างแรก
  const bookFromCard = (room: MeetingRoom) => {
    openBooking(room, BOOKING_START_HOUR);
  };

  // options ใน dropdown ของ booking modal — กรองเฉพาะเวลาที่ถูกจองจริง
  const bookedHours = draft ? getBookedHours(draft.room.id) : new Set<number>();
  const startOptions = HOURS.filter((h) => !bookedHours.has(h));
  const nextBookedAfterStart = [...bookedHours].filter((h) => h > form.startHour).sort((a, b) => a - b)[0] ?? BOOKING_END_HOUR;
  const endOptions = [...HOURS, BOOKING_END_HOUR].filter((h) => h > form.startHour && h <= nextBookedAfterStart);

  const changeStart = (s: number) => {
    const nextBooked = [...bookedHours].filter((h) => h > s).sort((a, b) => a - b)[0] ?? BOOKING_END_HOUR;
    setForm((f) => ({ ...f, startHour: s, endHour: Math.min(s + 1, nextBooked) }));
  };

  const openAddRoom = () => {
    setEditRoomId(null);
    setRoomForm(emptyRoomForm);
    setRoomModalOpen(true);
  };

  const openEditRoom = (room: MeetingRoom) => {
    setEditRoomId(room.id);
    setRoomForm({ name: room.name, capacity: String(room.capacity), floor: room.floor, amenities: room.amenities.join(", ") });
    setRoomModalOpen(true);
  };

  const saveRoom = () => {
    if (!roomForm.name.trim()) { toast("กรุณาใส่ชื่อห้อง", "error"); return; }
    const amenities = roomForm.amenities.split(",").map((a) => a.trim()).filter(Boolean);
    const capacity = Number(roomForm.capacity) || 1;
    if (editRoomId) {
      setRooms((prev) => prev.map((r) => r.id === editRoomId
        ? { ...r, name: roomForm.name.trim(), capacity, floor: roomForm.floor.trim() || "-", amenities }
        : r));
      toast("บันทึกห้องแล้ว");
    } else {
      const newRoom: MeetingRoom = {
        id: `room-${Date.now()}`,
        name: roomForm.name.trim(),
        capacity,
        floor: roomForm.floor.trim() || "-",
        branchName: "HQ",
        amenities,
        color: roomColorCycle[rooms.length % roomColorCycle.length],
      };
      setRooms((prev) => [...prev, newRoom]);
      toast(`เพิ่มห้อง ${newRoom.name} แล้ว`);
    }
    setRoomModalOpen(false);
  };

  const confirmDeleteRoom = () => {
    if (!deleteRoomId) return;
    setRooms((prev) => prev.filter((r) => r.id !== deleteRoomId));
    setBookings((prev) => prev.filter((b) => b.roomId !== deleteRoomId));
    toast("ลบห้องแล้ว", "info");
    setDeleteRoomId(null);
  };

  const submitBooking = () => {
    if (!draft) return;
    if (!form.title.trim()) { toast("กรุณาใส่หัวข้อการประชุม", "error"); return; }
    if (!form.bookedById) { toast("กรุณาเลือกผู้จอง", "error"); return; }
    if (form.endHour <= form.startHour) { toast("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม", "error"); return; }

    const overlap = dayBookings.some(
      (b) => b.roomId === draft.room.id && form.startHour < b.endHour && form.endHour > b.startHour
    );
    if (overlap) { toast("ช่วงเวลานี้ถูกจองแล้ว", "error"); return; }

    const emp = mockEmployees.find((e) => e.id === form.bookedById)!;
    const newBooking: RoomBooking = {
      id: `bk-${Date.now()}`,
      roomId: draft.room.id,
      date: selectedDate,
      startHour: form.startHour,
      endHour: form.endHour,
      title: form.title.trim(),
      bookedBy: emp.fullName,
      bookedById: emp.id,
    };
    setBookings((prev) => [...prev, newBooking]);
    toast(`จอง ${draft.room.name} สำเร็จ`);
    setDraft(null);
  };

  const confirmCancelBooking = () => {
    if (!cancelId) return;
    setBookings((prev) => prev.filter((b) => b.id !== cancelId));
    toast("ยกเลิกการจองแล้ว", "info");
    setCancelId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="ห้องประชุม" breadcrumbs={["สถานที่", "ห้องประชุม"]} />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* KPI + date */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid grid-cols-3 gap-3 flex-1 min-w-[280px]">
            {[
              { label: "ห้องทั้งหมด", value: stats.totalRooms,    icon: <DoorOpen size={16} />,     color: "text-gold-600",  bg: "bg-gold-50" },
              { label: "ว่างตอนนี้",  value: stats.freeNow,        icon: <CalendarCheck size={16} />, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "จองวันนี้",   value: stats.bookingsToday,  icon: <Clock size={16} />,        color: "text-amber-600",   bg: "bg-amber-50" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", c.bg)}>
                  <span className={c.color}>{c.icon}</span>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{c.value}</p>
                  <p className="text-[11px] text-slate-400">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <Label className="text-[11px] text-slate-400">เลือกวันที่</Label>
            <Input type="date" value={selectedDate} min={today} onChange={(e) => setSelectedDate(e.target.value)} className="h-8 mt-1" />
          </div>
          <Button onClick={openAddRoom} className="h-[58px]">
            <Plus size={15} /> เพิ่มห้องประชุม
          </Button>
        </div>

        {/* Hour legend */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-40 shrink-0" />
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${HOURS.length}, minmax(0, 1fr))` }}>
              {HOURS.map((h) => (
                <div key={h} className="text-[10px] text-slate-400 text-center border-l border-slate-100">{h}:00</div>
              ))}
            </div>
          </div>

          {/* Room rows */}
          <div className="space-y-2">
            {rooms.map((room) => {
              const color = roomColorMap[room.color];
              const roomBookings = dayBookings.filter((b) => b.roomId === room.id);
              return (
                <div key={room.id} className="flex items-stretch gap-3">
                  {/* Room info */}
                  <div className="w-40 shrink-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", color.bar)} />
                      <p className="text-sm font-semibold text-slate-800 truncate">{room.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Users size={9} /> {room.capacity} ที่นั่ง · {room.floor}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative grid h-12 rounded-lg overflow-hidden border border-slate-100" style={{ gridTemplateColumns: `repeat(${HOURS.length}, minmax(0, 1fr))` }}>
                    {HOURS.map((h) => {
                      const booking = roomBookings.find((b) => h >= b.startHour && h < b.endHour);
                      const isStart = booking && booking.startHour === h;
                      if (booking) {
                        if (!isStart) return null;
                        const span = booking.endHour - booking.startHour;
                        return (
                          <div
                            key={h}
                            style={{ gridColumn: `span ${span}` }}
                            className={cn("group relative flex items-center px-2 text-white text-[10px] font-medium", color.bar)}
                            title={`${booking.title} · ${booking.bookedBy}`}
                          >
                            <span className="truncate">{booking.title}</span>
                            <button
                              onClick={() => setCancelId(booking.id)}
                              className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 bg-black/20 hover:bg-black/40 rounded p-0.5 transition-opacity"
                              title="ยกเลิก"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={h}
                          onClick={() => openBooking(room, h)}
                          className="border-l border-slate-100 transition-colors hover:bg-gold-50 cursor-pointer"
                          title={`จอง ${h}:00`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <Plus size={11} /> คลิกช่องเวลาว่างเพื่อจอง · hover การจองเพื่อยกเลิก
          </p>
        </div>

        {/* Room cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {meetingRooms.map((room) => {
            const color = roomColorMap[room.color];
            const cnt = dayBookings.filter((b) => b.roomId === room.id).length;
            return (
              <div key={room.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color.soft)}>
                    <DoorOpen size={18} className={color.text} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 mr-1">{cnt} จองวันนี้</span>
                    <button onClick={() => openEditRoom(room)} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all" title="แก้ไขห้อง">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteRoomId(room.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" title="ลบห้อง">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-slate-900 text-sm">{room.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Users size={11} /> {room.capacity} ที่นั่ง
                  <span className="text-slate-300">·</span>
                  <MapPin size={11} /> {room.floor}
                </p>
                <div className="flex flex-wrap gap-1 mt-3 flex-1">
                  {room.amenities.map((a) => (
                    <span key={a} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-100 px-1.5 py-0.5 rounded">{a}</span>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => bookFromCard(room)}>
                  <CalendarPlus size={14} /> จองห้องนี้
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking modal */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDraft(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">จอง {draft.room.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long" }).format(new Date(selectedDate))}</p>
              </div>
              <button onClick={() => setDraft(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label>หัวข้อการประชุม *</Label>
                <Input placeholder="เช่น ประชุมทีม Design" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>ผู้จอง *</Label>
                <select className={selectClass} value={form.bookedById} onChange={(e) => setForm((f) => ({ ...f, bookedById: e.target.value }))}>
                  <option value="">เลือกคน</option>
                  {mockEmployees.map((e) => (
                    <option key={e.id} value={e.id}>{e.fullName} — {e.positionName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>เวลาเริ่ม</Label>
                  <select className={selectClass} value={form.startHour} onChange={(e) => changeStart(Number(e.target.value))}>
                    {startOptions.map((h) => <option key={h} value={h}>{h}:00</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>เวลาสิ้นสุด</Label>
                  <select className={selectClass} value={form.endHour} onChange={(e) => setForm((f) => ({ ...f, endHour: Number(e.target.value) }))}>
                    {endOptions.map((h) => <option key={h} value={h}>{h}:00</option>)}
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                * เวลาที่มีคนจองแล้วจะไม่แสดงให้เลือก
              </p>
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
              <Button variant="outline" className="flex-1" onClick={() => setDraft(null)}>ยกเลิก</Button>
              <Button className="flex-1" onClick={submitBooking}>ยืนยันการจอง</Button>
            </div>
          </div>
        </div>
      )}

      {/* Room add/edit modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRoomModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">{editRoomId ? "แก้ไขห้องประชุม" : "เพิ่มห้องประชุม"}</h2>
              <button onClick={() => setRoomModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label>ชื่อห้อง *</Label>
                <Input placeholder="เช่น Meeting Room 301" value={roomForm.name} onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>ความจุ (ที่นั่ง)</Label>
                  <Input type="number" value={roomForm.capacity} onChange={(e) => setRoomForm((f) => ({ ...f, capacity: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>ชั้น/ที่ตั้ง</Label>
                  <Input placeholder="เช่น ชั้น 3" value={roomForm.floor} onChange={(e) => setRoomForm((f) => ({ ...f, floor: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>อุปกรณ์ (คั่นด้วยจุลภาค ,)</Label>
                <Input placeholder="โปรเจกเตอร์, ไวท์บอร์ด, TV" value={roomForm.amenities} onChange={(e) => setRoomForm((f) => ({ ...f, amenities: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
              <Button variant="outline" className="flex-1" onClick={() => setRoomModalOpen(false)}>ยกเลิก</Button>
              <Button className="flex-1" onClick={saveRoom}>{editRoomId ? "บันทึก" : "เพิ่มห้อง"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete room confirm */}
      {deleteRoomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteRoomId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-slate-900">ลบห้องประชุม</h2>
            <p className="text-sm text-slate-500 mt-1">
              ลบ &ldquo;{rooms.find((r) => r.id === deleteRoomId)?.name}&rdquo; และการจองทั้งหมดของห้องนี้?
            </p>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteRoomId(null)}>ยกเลิก</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={confirmDeleteRoom}>ลบ</Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel booking confirm */}
      {cancelId && (() => {
        const bk = bookings.find((b) => b.id === cancelId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCancelId(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h2 className="text-base font-bold text-slate-900">ยกเลิกการจอง</h2>
              <p className="text-sm text-slate-500 mt-1">
                {bk ? `ยกเลิก "${bk.title}" (${bk.startHour}:00–${bk.endHour}:00)?` : "ยกเลิกการจองนี้?"}
              </p>
              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setCancelId(null)}>ไม่ยกเลิก</Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={confirmCancelBooking}>ยกเลิกการจอง</Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
