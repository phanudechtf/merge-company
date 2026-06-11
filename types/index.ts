export type Status = "active" | "inactive" | "recruiting";

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
}

export interface JobLevel {
  id: string;
  code: string;
  name: string;
  order: number;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  department: Department;
  branchId: string;
  branch: Branch;
  jobLevelId: string;
  jobLevel: JobLevel;
  salaryMin: number;
  salaryMax: number;
  employeeCount: number;
  status: Status;
  description?: string;
  requirements?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PositionCreateInput {
  code: string;
  name: string;
  departmentId: string;
  branchId: string;
  jobLevelId: string;
  salaryMin: number;
  salaryMax: number;
  status: Status;
  description?: string;
  requirements?: string;
  notes?: string;
}

export interface SummaryStats {
  totalPositions: number;
  totalDepartments: number;
  recruitingPositions: number;
  totalEmployees: number;
  totalBranches: number;
}
