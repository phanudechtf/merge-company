import type { Department, Branch, JobLevel, Position, PositionCreateInput } from "@/types";

export const departments: Department[] = [
  { id: "dept-1", code: "MGMT", name: "บริหาร" },
  { id: "dept-2", code: "IT", name: "IT" },
  { id: "dept-3", code: "INT", name: "Interior" },
  { id: "dept-4", code: "PURCH", name: "จัดซื้อ" },
  { id: "dept-5", code: "ACC", name: "บัญชี" },
  { id: "dept-6", code: "HR", name: "HR" },
  { id: "dept-7", code: "STK", name: "สต๊อก" },
  { id: "dept-8", code: "MKT", name: "Creative & Marketing" },
  { id: "dept-9", code: "DSG", name: "Design" },
  { id: "dept-10", code: "SALES", name: "ขาย" },
];

export const branches: Branch[] = [
  { id: "br-1", code: "HQ", name: "HQ" },
  { id: "br-2", code: "SSQ", name: "Siam Square" },
  { id: "br-3", code: "SC", name: "Siam Center" },
  { id: "br-4", code: "MEGA", name: "Mega Bangna" },
  { id: "br-5", code: "CR9", name: "Central Rama 9" },
  { id: "br-6", code: "FI", name: "Fashion Island" },
  { id: "br-7", code: "TMB", name: "The Mall Bangkapi" },
  { id: "br-8", code: "WH", name: "Warehouse" },
];

export const jobLevels: JobLevel[] = [
  { id: "jl-1", code: "C", name: "C-Level", order: 1 },
  { id: "jl-2", code: "DIR", name: "Director", order: 2 },
  { id: "jl-3", code: "MGR", name: "Manager", order: 3 },
  { id: "jl-4", code: "SR", name: "Senior", order: 4 },
  { id: "jl-5", code: "MID", name: "Mid-Level", order: 5 },
  { id: "jl-6", code: "JR", name: "Junior", order: 6 },
  { id: "jl-7", code: "ENTRY", name: "Entry Level", order: 7 },
  { id: "jl-8", code: "INT", name: "Intern", order: 8 },
];

function d(id: string) { return departments.find((x) => x.id === id)!; }
function b(id: string) { return branches.find((x) => x.id === id)!; }
function l(id: string) { return jobLevels.find((x) => x.id === id)!; }

const seed: Position[] = [
  {
    id: "pos-1", code: "MGMT-001", name: "CEO",
    departmentId: "dept-1", department: d("dept-1"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-1", jobLevel: l("jl-1"),
    salaryMin: 200000, salaryMax: 500000, employeeCount: 1, status: "active",
    description: "รับผิดชอบทิศทางและกลยุทธ์องค์กรทั้งหมด",
    requirements: "ประสบการณ์บริหารองค์กร 10+ ปี MBA หรือเทียบเท่า",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-2", code: "MGMT-002", name: "Operations Manager",
    departmentId: "dept-1", department: d("dept-1"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-3", jobLevel: l("jl-3"),
    salaryMin: 80000, salaryMax: 150000, employeeCount: 1, status: "active",
    description: "ดูแลการดำเนินงานประจำวันของบริษัท",
    requirements: "ประสบการณ์บริหารการดำเนินงาน 7+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-3", code: "MGMT-003", name: "Executive Assistant",
    departmentId: "dept-1", department: d("dept-1"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-6", jobLevel: l("jl-6"),
    salaryMin: 25000, salaryMax: 45000, employeeCount: 1, status: "inactive",
    description: "สนับสนุนงานผู้บริหารระดับสูง",
    requirements: "ประสบการณ์งาน EA 2+ ปี ภาษาอังกฤษดี",
    createdAt: "2025-10-05T00:00:00.000Z", updatedAt: "2025-10-05T00:00:00.000Z",
  },
  {
    id: "pos-4", code: "HR-001", name: "HR Manager",
    departmentId: "dept-6", department: d("dept-6"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-3", jobLevel: l("jl-3"),
    salaryMin: 60000, salaryMax: 100000, employeeCount: 1, status: "active",
    description: "วางแผนและบริหารงาน HR ทั้งหมด",
    requirements: "ประสบการณ์ HR Manager 5+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-5", code: "HR-002", name: "HR Officer",
    departmentId: "dept-6", department: d("dept-6"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-6", jobLevel: l("jl-6"),
    salaryMin: 25000, salaryMax: 45000, employeeCount: 3, status: "recruiting",
    description: "ดูแลงาน HR ทั่วไป รับสมัครพนักงาน จัดการเอกสาร",
    requirements: "ปริญญาตรี HRM หรือสาขาที่เกี่ยวข้อง",
    createdAt: "2025-11-01T00:00:00.000Z", updatedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "pos-6", code: "ACC-001", name: "Accountant",
    departmentId: "dept-5", department: d("dept-5"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-5", jobLevel: l("jl-5"),
    salaryMin: 30000, salaryMax: 60000, employeeCount: 4, status: "active",
    description: "จัดทำบัญชี รายงานการเงิน ภาษี",
    requirements: "ปริญญาตรีบัญชี CPD ใบอนุญาตผู้ทำบัญชี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-7", code: "ACC-002", name: "Finance Manager",
    departmentId: "dept-5", department: d("dept-5"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-3", jobLevel: l("jl-3"),
    salaryMin: 60000, salaryMax: 100000, employeeCount: 1, status: "active",
    description: "บริหารการเงิน งบประมาณ และรายงาน CFO",
    requirements: "ปริญญาตรีบัญชี/การเงิน ประสบการณ์ 7+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-8", code: "ACC-003", name: "Payroll Officer",
    departmentId: "dept-5", department: d("dept-5"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-6", jobLevel: l("jl-6"),
    salaryMin: 25000, salaryMax: 45000, employeeCount: 1, status: "recruiting",
    description: "ดูแลการจ่ายเงินเดือน ประกันสังคม ภาษีหัก ณ ที่จ่าย",
    requirements: "ปริญญาตรีบัญชี ประสบการณ์ payroll 2+ ปี",
    createdAt: "2026-01-10T00:00:00.000Z", updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "pos-9", code: "IT-001", name: "IT Manager",
    departmentId: "dept-2", department: d("dept-2"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-3", jobLevel: l("jl-3"),
    salaryMin: 70000, salaryMax: 120000, employeeCount: 1, status: "active",
    description: "บริหารโครงสร้างพื้นฐาน IT และทีม developer",
    requirements: "ประสบการณ์ IT Manager 5+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-10", code: "IT-002", name: "IT Support",
    departmentId: "dept-2", department: d("dept-2"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-7", jobLevel: l("jl-7"),
    salaryMin: 20000, salaryMax: 35000, employeeCount: 2, status: "recruiting",
    description: "ดูแลและแก้ไขปัญหาระบบ IT ภายในองค์กร",
    requirements: "วุฒิ ปวส./ปริญญาตรี IT ประสบการณ์ 1+ ปี",
    createdAt: "2026-02-01T00:00:00.000Z", updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "pos-11", code: "IT-003", name: "Software Developer",
    departmentId: "dept-2", department: d("dept-2"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-5", jobLevel: l("jl-5"),
    salaryMin: 45000, salaryMax: 90000, employeeCount: 0, status: "recruiting",
    description: "พัฒนาและดูแลระบบซอฟต์แวร์ภายในองค์กร",
    requirements: "ปริญญาตรี CS/IT ประสบการณ์ 3+ ปี Node.js, React",
    createdAt: "2026-03-01T00:00:00.000Z", updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "pos-12", code: "INT-001", name: "Interior Designer",
    departmentId: "dept-3", department: d("dept-3"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-5", jobLevel: l("jl-5"),
    salaryMin: 35000, salaryMax: 70000, employeeCount: 5, status: "active",
    description: "ออกแบบพื้นที่ร้านค้าและโชว์รูม",
    requirements: "ปริญญาตรีออกแบบภายใน ประสบการณ์ 3+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-13", code: "INT-002", name: "Project Coordinator",
    departmentId: "dept-3", department: d("dept-3"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-4", jobLevel: l("jl-4"),
    salaryMin: 50000, salaryMax: 80000, employeeCount: 2, status: "active",
    description: "ประสานงานโครงการตกแต่งและงาน renovation",
    requirements: "ประสบการณ์ PM 4+ ปี",
    createdAt: "2025-11-01T00:00:00.000Z", updatedAt: "2025-11-01T00:00:00.000Z",
  },
  {
    id: "pos-14", code: "PURCH-001", name: "Purchasing Officer",
    departmentId: "dept-4", department: d("dept-4"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-6", jobLevel: l("jl-6"),
    salaryMin: 25000, salaryMax: 45000, employeeCount: 2, status: "active",
    description: "จัดซื้อวัตถุดิบ วัสดุสิ้นเปลือง และสินค้า",
    requirements: "ปริญญาตรีบริหาร ประสบการณ์ 2+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-15", code: "STK-001", name: "Stock Manager",
    departmentId: "dept-7", department: d("dept-7"),
    branchId: "br-8", branch: b("br-8"),
    jobLevelId: "jl-3", jobLevel: l("jl-3"),
    salaryMin: 45000, salaryMax: 80000, employeeCount: 1, status: "active",
    description: "บริหารคลังสินค้าและระบบ inventory",
    requirements: "ประสบการณ์ warehouse management 5+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-16", code: "STK-002", name: "Warehouse Staff",
    departmentId: "dept-7", department: d("dept-7"),
    branchId: "br-8", branch: b("br-8"),
    jobLevelId: "jl-7", jobLevel: l("jl-7"),
    salaryMin: 18000, salaryMax: 30000, employeeCount: 8, status: "recruiting",
    description: "รับ-ส่งสินค้า จัดเก็บ ตรวจนับสต๊อก",
    requirements: "วุฒิ ม.6/ปวช. ขึ้นไป มีประสบการณ์เป็นพิเศษ",
    createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "pos-17", code: "MKT-001", name: "Creative Director",
    departmentId: "dept-8", department: d("dept-8"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-2", jobLevel: l("jl-2"),
    salaryMin: 100000, salaryMax: 180000, employeeCount: 1, status: "active",
    description: "กำหนดทิศทาง creative ของแบรนด์ MERGE",
    requirements: "ประสบการณ์ Creative/Art Director 8+ ปี portfolio แข็งแกร่ง",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-18", code: "MKT-002", name: "Marketing Executive",
    departmentId: "dept-8", department: d("dept-8"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-6", jobLevel: l("jl-6"),
    salaryMin: 25000, salaryMax: 50000, employeeCount: 3, status: "active",
    description: "วางแผนและดำเนินกิจกรรมการตลาด",
    requirements: "ปริญญาตรีการตลาด ประสบการณ์ 2+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-19", code: "MKT-003", name: "Social Media Specialist",
    departmentId: "dept-8", department: d("dept-8"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-6", jobLevel: l("jl-6"),
    salaryMin: 22000, salaryMax: 40000, employeeCount: 2, status: "active",
    description: "ดูแล social media ทุก channel ของ MERGE",
    requirements: "ประสบการณ์ social media 2+ ปี เข้าใจ fashion",
    createdAt: "2025-11-01T00:00:00.000Z", updatedAt: "2025-11-01T00:00:00.000Z",
  },
  {
    id: "pos-20", code: "DSG-001", name: "Fashion Designer",
    departmentId: "dept-9", department: d("dept-9"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-4", jobLevel: l("jl-4"),
    salaryMin: 50000, salaryMax: 90000, employeeCount: 3, status: "active",
    description: "ออกแบบคอลเลกชั่นเสื้อผ้าแบรนด์ MERGE",
    requirements: "ปริญญาตรีออกแบบแฟชั่น ประสบการณ์ 4+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-21", code: "DSG-002", name: "Graphic Designer",
    departmentId: "dept-9", department: d("dept-9"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-5", jobLevel: l("jl-5"),
    salaryMin: 30000, salaryMax: 55000, employeeCount: 4, status: "active",
    description: "ออกแบบสื่อ digital และ print",
    requirements: "ปริญญาตรีออกแบบนิเทศ Adobe Suite ชำนาญ",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-22", code: "DSG-003", name: "Visual Merchandiser",
    departmentId: "dept-9", department: d("dept-9"),
    branchId: "br-2", branch: b("br-2"),
    jobLevelId: "jl-6", jobLevel: l("jl-6"),
    salaryMin: 22000, salaryMax: 40000, employeeCount: 3, status: "active",
    description: "จัดแสดงสินค้าในร้านให้น่าดึงดูด",
    requirements: "ประสบการณ์ VM retail 2+ ปี",
    createdAt: "2025-11-01T00:00:00.000Z", updatedAt: "2025-11-01T00:00:00.000Z",
  },
  {
    id: "pos-23", code: "SALES-001", name: "Merchandiser",
    departmentId: "dept-10", department: d("dept-10"),
    branchId: "br-1", branch: b("br-1"),
    jobLevelId: "jl-5", jobLevel: l("jl-5"),
    salaryMin: 30000, salaryMax: 60000, employeeCount: 2, status: "active",
    description: "วางแผน assortment สินค้าและจัดการ inventory ร้านค้า",
    requirements: "ประสบการณ์ retail merchandising 3+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-24", code: "SALES-002", name: "Sales Manager",
    departmentId: "dept-10", department: d("dept-10"),
    branchId: "br-2", branch: b("br-2"),
    jobLevelId: "jl-3", jobLevel: l("jl-3"),
    salaryMin: 50000, salaryMax: 90000, employeeCount: 1, status: "active",
    description: "บริหารทีมขายและยอดขายสาขา Siam Square",
    requirements: "ประสบการณ์ retail sales manager 5+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-25", code: "SALES-003", name: "Store Manager",
    departmentId: "dept-10", department: d("dept-10"),
    branchId: "br-3", branch: b("br-3"),
    jobLevelId: "jl-3", jobLevel: l("jl-3"),
    salaryMin: 45000, salaryMax: 80000, employeeCount: 1, status: "active",
    description: "ดูแลการดำเนินงานร้านค้า Siam Center ทั้งหมด",
    requirements: "ประสบการณ์ store management 4+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-26", code: "SALES-004", name: "Store Manager",
    departmentId: "dept-10", department: d("dept-10"),
    branchId: "br-5", branch: b("br-5"),
    jobLevelId: "jl-3", jobLevel: l("jl-3"),
    salaryMin: 45000, salaryMax: 80000, employeeCount: 1, status: "active",
    description: "ดูแลการดำเนินงานร้านค้า Central Rama 9",
    requirements: "ประสบการณ์ store management 4+ ปี",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-27", code: "SALES-005", name: "Sales Associate",
    departmentId: "dept-10", department: d("dept-10"),
    branchId: "br-2", branch: b("br-2"),
    jobLevelId: "jl-7", jobLevel: l("jl-7"),
    salaryMin: 18000, salaryMax: 30000, employeeCount: 12, status: "active",
    description: "ให้บริการลูกค้าและขายสินค้า",
    requirements: "วุฒิ ม.6/ปวช. ขึ้นไป รักงานบริการ",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "pos-28", code: "SALES-006", name: "Cashier",
    departmentId: "dept-10", department: d("dept-10"),
    branchId: "br-4", branch: b("br-4"),
    jobLevelId: "jl-7", jobLevel: l("jl-7"),
    salaryMin: 17000, salaryMax: 25000, employeeCount: 6, status: "active",
    description: "รับชำระเงินและดูแลงานแคชเชียร์",
    requirements: "วุฒิ ม.6 ขึ้นไป ละเอียดรอบคอบ",
    createdAt: "2025-10-01T00:00:00.000Z", updatedAt: "2025-10-01T00:00:00.000Z",
  },
];

let positions: Position[] = [...seed];

export function getPositions(): Position[] {
  return positions;
}

export function getPositionById(id: string): Position | undefined {
  return positions.find((p) => p.id === id);
}

export function isCodeDuplicate(code: string, excludeId?: string): boolean {
  return positions.some((p) => p.code === code && p.id !== excludeId);
}

export function createPosition(input: PositionCreateInput): Position {
  const dept = departments.find((x) => x.id === input.departmentId);
  const branch = branches.find((x) => x.id === input.branchId);
  const jobLevel = jobLevels.find((x) => x.id === input.jobLevelId);
  if (!dept || !branch || !jobLevel) throw new Error("Invalid reference ID");
  const newPos: Position = {
    ...input,
    id: `pos-${Date.now()}`,
    department: dept,
    branch: branch,
    jobLevel: jobLevel,
    employeeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  positions = [...positions, newPos];
  return newPos;
}

export function updatePosition(id: string, input: Partial<PositionCreateInput>): Position | null {
  const idx = positions.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const existing = positions[idx];
  const dept = input.departmentId ? departments.find((x) => x.id === input.departmentId) ?? existing.department : existing.department;
  const branch = input.branchId ? branches.find((x) => x.id === input.branchId) ?? existing.branch : existing.branch;
  const jobLevel = input.jobLevelId ? jobLevels.find((x) => x.id === input.jobLevelId) ?? existing.jobLevel : existing.jobLevel;
  const updated: Position = {
    ...existing,
    ...input,
    department: dept,
    branch: branch,
    jobLevel: jobLevel,
    updatedAt: new Date().toISOString(),
  };
  positions = positions.map((p) => (p.id === id ? updated : p));
  return updated;
}

export function deletePosition(id: string): boolean {
  const before = positions.length;
  positions = positions.filter((p) => p.id !== id);
  return positions.length < before;
}

export function getSummaryStats() {
  return {
    totalPositions: positions.length,
    totalDepartments: departments.length,
    recruitingPositions: positions.filter((p) => p.status === "recruiting").length,
    totalEmployees: positions.reduce((sum, p) => sum + p.employeeCount, 0),
    totalBranches: branches.length,
  };
}
