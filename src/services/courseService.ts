import { USE_MOCK, http } from "./apiClient";
import { mockApi } from "./mockApi";
import type { Course } from "./types";

/** REST contract: /api/courses */
export const courseService = {
  /** GET /api/courses */
  list: (): Promise<Course[]> => (USE_MOCK ? mockApi.getCourses() : http<Course[]>("/api/courses")),

  /** POST /api/courses */
  create: (payload: Omit<Course, "id">): Promise<Course> =>
    USE_MOCK
      ? mockApi.createCourse(payload)
      : http<Course>("/api/courses", { method: "POST", body: JSON.stringify(payload) }),

  /** PUT /api/courses/{id} */
  update: (id: number, payload: Partial<Course>): Promise<Course> =>
    USE_MOCK
      ? mockApi.updateCourse(id, payload)
      : http<Course>(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  /** DELETE /api/courses/{id} */
  remove: (id: number): Promise<void> =>
    USE_MOCK ? mockApi.deleteCourse(id) : http<void>(`/api/courses/${id}`, { method: "DELETE" }),
};
