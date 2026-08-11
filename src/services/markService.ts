import { USE_MOCK, http } from "./apiClient";
import { mockApi } from "./mockApi";
import type { Mark } from "./types";

/** REST contract: /api/marks */
export const markService = {
  /** GET /api/marks */
  list: (): Promise<Mark[]> => (USE_MOCK ? mockApi.getMarks() : http<Mark[]>("/api/marks")),

  /** GET /api/marks/student/{studentId} */
  listByStudent: (studentId: string): Promise<Mark[]> =>
    USE_MOCK ? mockApi.getMarksByStudent(studentId) : http<Mark[]>(`/api/marks/student/${studentId}`),

  /** POST /api/marks */
  create: (payload: Omit<Mark, "id">): Promise<Mark> =>
    USE_MOCK
      ? mockApi.createMark(payload)
      : http<Mark>("/api/marks", { method: "POST", body: JSON.stringify(payload) }),

  /** DELETE /api/marks/{id} */
  remove: (id: number): Promise<void> =>
    USE_MOCK ? mockApi.deleteMark(id) : http<void>(`/api/marks/${id}`, { method: "DELETE" }),
};
