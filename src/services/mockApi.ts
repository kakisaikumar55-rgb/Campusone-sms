import { delay } from "./apiClient";
import * as seed from "./mockData";
import type { Attendance, Course, Department, Mark, Student } from "./types";

/** In-memory database that mimics the future MySQL tables. */
const db = {
  students: [...seed.students],
  courses: [...seed.courses],
  departments: [...seed.departments],
  marks: [...seed.marks],
  attendance: [...seed.attendance],
};

const nextId = (rows: { id: number }[]) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;

export const mockApi = {
  async getStudents(): Promise<Student[]> {
    await delay();
    return [...db.students];
  },
  async getStudent(studentId: string): Promise<Student | undefined> {
    await delay(200);
    return db.students.find((s) => s.studentId === studentId);
  },
  async createStudent(payload: Omit<Student, "id">): Promise<Student> {
    await delay();
    const student: Student = { ...payload, id: nextId(db.students) };
    db.students = [student, ...db.students];
    return student;
  },
  async updateStudent(studentId: string, payload: Partial<Student>): Promise<Student> {
    await delay();
    db.students = db.students.map((s) => (s.studentId === studentId ? { ...s, ...payload } : s));
    return db.students.find((s) => s.studentId === studentId)!;
  },
  async deleteStudent(studentId: string): Promise<void> {
    await delay();
    db.students = db.students.filter((s) => s.studentId !== studentId);
  },

  async getCourses(): Promise<Course[]> {
    await delay();
    return [...db.courses];
  },
  async createCourse(payload: Omit<Course, "id">): Promise<Course> {
    await delay();
    const course: Course = { ...payload, id: nextId(db.courses) };
    db.courses = [course, ...db.courses];
    return course;
  },
  async updateCourse(id: number, payload: Partial<Course>): Promise<Course> {
    await delay();
    db.courses = db.courses.map((c) => (c.id === id ? { ...c, ...payload } : c));
    return db.courses.find((c) => c.id === id)!;
  },
  async deleteCourse(id: number): Promise<void> {
    await delay();
    db.courses = db.courses.filter((c) => c.id !== id);
  },

  async getDepartments(): Promise<Department[]> {
    await delay();
    return [...db.departments];
  },
  async createDepartment(payload: Omit<Department, "id">): Promise<Department> {
    await delay();
    const dept: Department = { ...payload, id: nextId(db.departments) };
    db.departments = [dept, ...db.departments];
    return dept;
  },
  async updateDepartment(id: number, payload: Partial<Department>): Promise<Department> {
    await delay();
    db.departments = db.departments.map((d) => (d.id === id ? { ...d, ...payload } : d));
    return db.departments.find((d) => d.id === id)!;
  },
  async deleteDepartment(id: number): Promise<void> {
    await delay();
    db.departments = db.departments.filter((d) => d.id !== id);
  },

  async getMarks(): Promise<Mark[]> {
    await delay();
    return [...db.marks];
  },
  async getMarksByStudent(studentId: string): Promise<Mark[]> {
    await delay(200);
    return db.marks.filter((m) => m.studentId === studentId);
  },
  async createMark(payload: Omit<Mark, "id">): Promise<Mark> {
    await delay();
    const mark: Mark = { ...payload, id: nextId(db.marks) };
    db.marks = [mark, ...db.marks];
    return mark;
  },
  async deleteMark(id: number): Promise<void> {
    await delay();
    db.marks = db.marks.filter((m) => m.id !== id);
  },

  async getAttendance(): Promise<Attendance[]> {
    await delay();
    return [...db.attendance];
  },
  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    await delay(200);
    return db.attendance.filter((a) => a.studentId === studentId);
  },
  async createAttendance(payload: Omit<Attendance, "id">): Promise<Attendance> {
    await delay();
    const row: Attendance = { ...payload, id: nextId(db.attendance) };
    db.attendance = [row, ...db.attendance];
    return row;
  },
  async deleteAttendance(id: number): Promise<void> {
    await delay();
    db.attendance = db.attendance.filter((a) => a.id !== id);
  },
};
