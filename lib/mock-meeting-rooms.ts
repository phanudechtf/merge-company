export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  branchName: string;
  amenities: string[];
  color: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  date: string;        // YYYY-MM-DD
  startHour: number;   // 8-18
  endHour: number;
  title: string;
  bookedBy: string;
  bookedById: string;
}

export const meetingRooms: MeetingRoom[] = [
  { id: "room-1", name: "Boardroom A",   capacity: 14, floor: "ชั้น 5", branchName: "HQ", amenities: ["โปรเจกเตอร์", "Video Conf", "ไวท์บอร์ด"], color: "violet" },
  { id: "room-2", name: "Meeting 201",   capacity: 8,  floor: "ชั้น 2", branchName: "HQ", amenities: ["TV 65\"", "ไวท์บอร์ด"],               color: "blue" },
  { id: "room-3", name: "Huddle Room",   capacity: 4,  floor: "ชั้น 2", branchName: "HQ", amenities: ["TV 43\""],                            color: "teal" },
  { id: "room-4", name: "Creative Lab",  capacity: 10, floor: "ชั้น 3", branchName: "HQ", amenities: ["โปรเจกเตอร์", "ไวท์บอร์ด", "Sofa"],   color: "pink" },
  { id: "room-5", name: "Training Hall", capacity: 30, floor: "ชั้น 6", branchName: "HQ", amenities: ["เวที", "ไมโครโฟน", "โปรเจกเตอร์ x2"], color: "orange" },
];

export const BOOKING_START_HOUR = 9;
export const BOOKING_END_HOUR = 18;

export const roomColorCycle = ["violet", "blue", "teal", "pink", "orange"];

export const roomColorMap: Record<string, { bar: string; soft: string; text: string; ring: string }> = {
  violet: { bar: "bg-violet-500",  soft: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-300" },
  blue:   { bar: "bg-blue-500",    soft: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-300" },
  teal:   { bar: "bg-teal-500",    soft: "bg-teal-50",    text: "text-teal-700",    ring: "ring-teal-300" },
  pink:   { bar: "bg-pink-500",    soft: "bg-pink-50",    text: "text-pink-700",    ring: "ring-pink-300" },
  orange: { bar: "bg-orange-500",  soft: "bg-orange-50",  text: "text-orange-700",  ring: "ring-orange-300" },
};

export function seedBookings(today: string): RoomBooking[] {
  return [
    { id: "bk-1", roomId: "room-1", date: today, startHour: 9,  endHour: 11, title: "ประชุมผู้บริหารรายสัปดาห์", bookedBy: "ปวิตร วงศ์สุวรรณ", bookedById: "emp-1" },
    { id: "bk-2", roomId: "room-2", date: today, startHour: 13, endHour: 14, title: "สัมภาษณ์ผู้สมัคร",           bookedBy: "พัชรี สุขสวัสดิ์",  bookedById: "emp-4" },
    { id: "bk-3", roomId: "room-4", date: today, startHour: 10, endHour: 12, title: "Brainstorm คอลเลคชันใหม่",   bookedBy: "ศิริ สร้างสรรค์",   bookedById: "emp-9" },
    { id: "bk-4", roomId: "room-1", date: today, startHour: 14, endHour: 16, title: "รีวิวงบประมาณ Q3",          bookedBy: "วิภาวี คงดี",       bookedById: "emp-5" },
  ];
}
