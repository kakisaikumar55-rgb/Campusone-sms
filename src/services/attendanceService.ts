import { USE_MOCK, http } from "./apiClient";
import { mockApi } from "./mockApi";
import type { Attendance } from "./types";

/** REST contract: /api/attendance */
export const attendanceService = {
  /** GET /api/attendance */
  list: (): Promise<Attendance[]> =>
    USE_MOCK ? mockApi.getAttendance() : http<Attendance[]>("/api/attendance"),

  /** GET /api/attendance/student/{studentId} */
  listByStudent: (studentId: string): Promise<Attendance[]> =>
    USE_MOCK
      ? mockApi.getAttendanceByStudent(studentId)
      : http<Attendance[]>(`/api/attendance/student/${studentId}`),

  /** POST /api/attendance */
  create: (payload: Omit<Attendance, "id">): Promise<Attendance> =>
    USE_MOCK
      ? mockApi.createAttendance(payload)
      : http<Attendance>("/api/attendance", { method: "POST", body: JSON.stringify(payload) }),

  /** DELETE /api/attendance/{id} */
  remove: (id: number): Promise<void> =>
    USE_MOCK ? mockApi.deleteAttendance(id) : http<void>(`/api/attendance/${id}`, { method: "DELETE" }),
};
