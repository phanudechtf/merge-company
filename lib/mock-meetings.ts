export type MeetingLocationType = "online" | "onsite" | "offsite";

export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  assigneeId?: string;
}

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  team: string;        // team / department label
  locationType: MeetingLocationType;
  locationDetail: string; // "Zoom", "Boardroom A", ...
  participantIds: string[];
  note: string;
  transcript: string;
  actionItems: ActionItem[];
  audioId?: string;       // key into IndexedDB audio store
  audioName?: string;     // original filename or "บันทึกสด"
  audioMime?: string;
  createdAt: string;       // ISO
}

export const MEETINGS_KEY = "merge-meetings-v1";

export const MEETING_TEAMS = [
  "บริหาร",
  "HR",
  "บัญชี",
  "IT",
  "Creative & Marketing",
  "Retail Operations",
  "Interior",
];

export const defaultMeetings: MeetingRecord[] = [
  {
    id: "mtg-1",
    title: "ประชุมผู้บริหารรายสัปดาห์",
    date: "2026-06-08",
    startTime: "09:00",
    endTime: "10:30",
    team: "บริหาร",
    locationType: "onsite",
    locationDetail: "Boardroom A",
    participantIds: ["emp-1", "emp-2", "emp-5", "emp-9"],
    note: "สรุปยอดขายเดือน พ.ค. โต 12% จากเป้า เน้นขยายช่องทาง online. ทบทวนแผนเปิด Pop-Up 2 สาขา Q3.",
    transcript: "",
    actionItems: [
      { id: "ai-1", text: "ทำแผนงบ marketing online Q3", done: false, assigneeId: "emp-9" },
      { id: "ai-2", text: "สรุปทำเล Pop-Up 2 สาขา", done: true, assigneeId: "emp-2" },
    ],
    createdAt: "2026-06-08T10:30:00.000Z",
  },
  {
    id: "mtg-2",
    title: "Brainstorm คอลเลคชัน Autumn",
    date: "2026-06-09",
    startTime: "13:00",
    endTime: "15:00",
    team: "Creative & Marketing",
    locationType: "onsite",
    locationDetail: "Creative Lab",
    participantIds: ["emp-9", "emp-10"],
    note: "ธีม Dark Feminine / Chrome. โทนหลักเงิน gunmetal. อ้างอิง McQueen, Mugler. ต้องได้ moodboard ภายในสัปดาห์หน้า.",
    transcript: "",
    actionItems: [
      { id: "ai-3", text: "ทำ moodboard chrome/silver", done: false, assigneeId: "emp-10" },
      { id: "ai-4", text: "หา supplier ผ้าโทนโลหะ", done: false },
    ],
    createdAt: "2026-06-09T15:00:00.000Z",
  },
  {
    id: "mtg-3",
    title: "Sync ทีม IT — ระบบ MERGE Workspace",
    date: "2026-06-11",
    startTime: "11:00",
    endTime: "11:45",
    team: "IT",
    locationType: "online",
    locationDetail: "Google Meet",
    participantIds: ["emp-7", "emp-8"],
    note: "วาง roadmap module ประชุม + audio note. ตกลงเก็บไฟล์เสียงใน IndexedDB ก่อน ค่อยต่อ backend ทีหลัง.",
    transcript: "",
    actionItems: [
      { id: "ai-5", text: "ทำ prototype หน้า /meetings", done: false, assigneeId: "emp-8" },
    ],
    createdAt: "2026-06-11T11:45:00.000Z",
  },
  {
    id: "mtg-4",
    title: "รีวิวงบประมาณ Q3",
    date: "2026-06-12",
    startTime: "14:00",
    endTime: "16:00",
    team: "บัญชี",
    locationType: "onsite",
    locationDetail: "Boardroom A",
    participantIds: ["emp-5", "emp-6", "emp-1"],
    note: "ตัดงบ event ลง 15% โยกไป online ads. อนุมัติงบ renovate 2 สาขา.",
    transcript: "",
    actionItems: [
      { id: "ai-6", text: "ปรับ budget sheet ตามมติ", done: false, assigneeId: "emp-6" },
    ],
    createdAt: "2026-06-12T16:00:00.000Z",
  },
];

export function loadMeetings(): MeetingRecord[] {
  if (typeof window === "undefined") return defaultMeetings;
  try {
    const raw = window.localStorage.getItem(MEETINGS_KEY);
    if (!raw) return defaultMeetings;
    const parsed = JSON.parse(raw) as MeetingRecord[];
    return Array.isArray(parsed) ? parsed : defaultMeetings;
  } catch {
    return defaultMeetings;
  }
}

export function saveMeetings(list: MeetingRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEETINGS_KEY, JSON.stringify(list));
}
