export interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  address: string;
  department: string;
  course: string;
  year: 1 | 2 | 3 | 4;
  status: "Active" | "Inactive";
}

export interface Course {
  id: number;
  courseId: string;
  name: string;
  duration: string;
  department: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  head: string;
}

export interface Mark {
  id: number;
  studentId: string;
  subject: string;
  internal: number;
  external: number;
}

export interface Attendance {
  id: number;
  studentId: string;
  subject: string;
  totalClasses: number;
  attendedClasses: number;
}

export const totalMarks = (m: Pick<Mark, "internal" | "external">) => m.internal + m.external;

export const gradeOf = (total: number) => {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  return "F";
};

export const resultOf = (total: number) => (total >= 50 ? "Pass" : "Fail");

export const attendancePercent = (a: Pick<Attendance, "totalClasses" | "attendedClasses">) =>
  a.totalClasses === 0 ? 0 : Math.round((a.attendedClasses / a.totalClasses) * 1000) / 10;
