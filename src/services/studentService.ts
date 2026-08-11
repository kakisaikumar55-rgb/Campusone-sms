import { USE_MOCK, http } from "./apiClient";
import { mockApi } from "./mockApi";
import type { Student } from "./types";

/** REST contract: /api/students */
export const studentService = {
  /** GET /api/students */
  list: (): Promise<Student[]> => (USE_MOCK ? mockApi.getStudents() : http<Student[]>("/api/students")),

  /** GET /api/students/{id} */
  get: (studentId: string): Promise<Student | undefined> =>
    USE_MOCK ? mockApi.getStudent(studentId) : http<Student>(`/api/students/${studentId}`),

  /** POST /api/students */
  create: (payload: Omit<Student, "id">): Promise<Student> =>
    USE_MOCK
      ? mockApi.createStudent(payload)
      : http<Student>("/api/students", { method: "POST", body: JSON.stringify(payload) }),

  /** PUT /api/students/{id} */
  update: (studentId: string, payload: Partial<Student>): Promise<Student> =>
    USE_MOCK
      ? mockApi.updateStudent(studentId, payload)
      : http<Student>(`/api/students/${studentId}`, { method: "PUT", body: JSON.stringify(payload) }),

  /** DELETE /api/students/{id} */
  remove: (studentId: string): Promise<void> =>
    USE_MOCK
      ? mockApi.deleteStudent(studentId)
      : http<void>(`/api/students/${studentId}`, { method: "DELETE" }),
};
