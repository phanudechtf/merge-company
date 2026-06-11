export interface OrgNode {
  id: string;
  name: string;
  title: string;
  departmentName: string;
  avatarInitials: string;
  parentId: string | null;
}

// Reporting structure ของ SENSE ASIA (อิงจาก mockEmployees)
export const orgNodes: OrgNode[] = [
  { id: "emp-1",  name: "ปวิตร วงศ์สุวรรณ",   title: "CEO",                 departmentName: "บริหาร",               avatarInitials: "ปว", parentId: null },
  { id: "emp-2",  name: "อรรถพล รุ่งเรือง",    title: "Operations Manager",  departmentName: "บริหาร",               avatarInitials: "อพ", parentId: "emp-1" },
  { id: "emp-3",  name: "สมชาย ใจดี",          title: "HR Manager",          departmentName: "HR",                   avatarInitials: "สช", parentId: "emp-2" },
  { id: "emp-4",  name: "พัชรี สุขสวัสดิ์",     title: "HR Officer",          departmentName: "HR",                   avatarInitials: "พช", parentId: "emp-3" },
  { id: "emp-5",  name: "วิภาวี คงดี",          title: "Finance Manager",     departmentName: "บัญชี",                avatarInitials: "วภ", parentId: "emp-2" },
  { id: "emp-6",  name: "ณัฐพล มีสุข",         title: "Accountant",          departmentName: "บัญชี",                avatarInitials: "ณพ", parentId: "emp-5" },
  { id: "emp-7",  name: "อรทัย พิมพ์ใจ",       title: "IT Manager",          departmentName: "IT",                   avatarInitials: "อท", parentId: "emp-2" },
  { id: "emp-8",  name: "ธนกร ช่างคิด",        title: "IT Support",          departmentName: "IT",                   avatarInitials: "ธก", parentId: "emp-7" },
  { id: "emp-21", name: "อภิสิทธิ์ เชี่ยวชาญ", title: "Developer",           departmentName: "IT",                   avatarInitials: "อส", parentId: "emp-7" },
  { id: "emp-9",  name: "ศิริ สร้างสรรค์",      title: "Creative Director",   departmentName: "Creative & Marketing", avatarInitials: "ศร", parentId: "emp-2" },
  { id: "emp-10", name: "พิมพ์ใจ สวยงาม",      title: "Marketing Executive", departmentName: "Creative & Marketing", avatarInitials: "พจ", parentId: "emp-9" },
  { id: "emp-20", name: "ตรีทิพย์ แสนสวย",     title: "Content Creator",     departmentName: "Creative & Marketing", avatarInitials: "ตท", parentId: "emp-9" },
  { id: "emp-19", name: "ชลิตา งามพร้อม",      title: "Graphic Designer",    departmentName: "Design",               avatarInitials: "ชล", parentId: "emp-9" },
  { id: "emp-13", name: "ปรีชา สต็อกดี",       title: "Stock Manager",       departmentName: "สต๊อก",                avatarInitials: "ปช", parentId: "emp-2" },
  { id: "emp-18", name: "ภูวนาท มั่นคง",        title: "Stock Officer",       departmentName: "สต๊อก",                avatarInitials: "ภว", parentId: "emp-13" },
  { id: "emp-15", name: "ธีรภัทร ขายเก่ง",     title: "Sales Manager",       departmentName: "ขาย",                  avatarInitials: "ธภ", parentId: "emp-2" },
  { id: "emp-16", name: "กานต์ ดีใจ",          title: "Sales Officer",       departmentName: "ขาย",                  avatarInitials: "กด", parentId: "emp-15" },
  { id: "emp-17", name: "มณี ส่องแสง",         title: "Sales Officer",       departmentName: "ขาย",                  avatarInitials: "มณ", parentId: "emp-15" },
  { id: "emp-22", name: "สุนิสา รักงาน",        title: "Senior Buyer",        departmentName: "จัดซื้อ",              avatarInitials: "สน", parentId: "emp-2" },
  { id: "emp-14", name: "วิชัย จัดหา",          title: "Purchasing Officer",  departmentName: "จัดซื้อ",              avatarInitials: "วช", parentId: "emp-22" },
  { id: "emp-11", name: "พิชัย ออกแบบ",        title: "Interior Designer",   departmentName: "Interior",             avatarInitials: "พช", parentId: "emp-2" },
  { id: "emp-12", name: "รัตนา แฟชั่น",         title: "Fashion Designer",    departmentName: "Design",               avatarInitials: "รน", parentId: "emp-2" },

  // ตำแหน่งจากประกาศรับสมัคร — จัดเข้าแผนกตามหน้าที่ (parent = คาดเดาสายบังคับบัญชา)
  { id: "emp-23", name: "สมหญิง ตัดเย็บ",      title: "Pattern Maker",            departmentName: "Design",               avatarInitials: "สญ", parentId: "emp-12" },
  { id: "emp-24", name: "นภัส แต่งสวย",         title: "Creative & Fashion Stylist", departmentName: "Creative & Marketing", avatarInitials: "นภ", parentId: "emp-9" },
  { id: "emp-25", name: "ธิดา ประสานงาน",      title: "PR & Influencer Coordinator", departmentName: "Creative & Marketing", avatarInitials: "ธด", parentId: "emp-9" },
  { id: "emp-26", name: "หลี่ เจริญทรัพย์",     title: "Purchasing (China)",       departmentName: "จัดซื้อ",              avatarInitials: "หล", parentId: "emp-22" },
  { id: "emp-27", name: "อนงค์ บัญชีดี",        title: "Senior Accountant",        departmentName: "บัญชี",                avatarInitials: "อง", parentId: "emp-5" },
  { id: "emp-28", name: "ปิยะ บริการดี",        title: "Customer Service",         departmentName: "ขาย",                  avatarInitials: "ปย", parentId: "emp-15" },
  { id: "emp-29", name: "สมบัติ ตรวจดี",        title: "Warehouse & QC Staff",     departmentName: "สต๊อก",                avatarInitials: "สบ", parentId: "emp-13" },
  { id: "emp-30", name: "ก้อง ขายดี",          title: "Sales (Part-time)",        departmentName: "ขาย",                  avatarInitials: "กอ", parentId: "emp-15" },
];
