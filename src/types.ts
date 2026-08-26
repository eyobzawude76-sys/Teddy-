export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDepartments: number;
  totalStudents: number;
  pendingApprovals: number;
  totalTeachers: number;
  totalModules: number;
  recentAuditActions: number;
}

export interface ActivityData {
  name: string;
  actions: number;
}

export interface PendingStudentSummary {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface DepartmentSummary {
  _id: string;
  name: string;
  studentCount: number;
  levelCount: number;
}

export interface RecordStats {
  totalStudents: number;
  pendingRecords: number;
  archivedRecords: number;
  recentTranscripts: number;
}

export const UserRoles = ['admin', 'teacher', 'student'] as const;
export type UserRole = typeof UserRoles[number];
export type UserStatus = 'active' | 'inactive';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId?: string;
}
