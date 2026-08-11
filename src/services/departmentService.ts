import { USE_MOCK, http } from "./apiClient";
import { mockApi } from "./mockApi";
import type { Department } from "./types";

/** REST contract: /api/departments */
export const departmentService = {
  /** GET /api/departments */
  list: (): Promise<Department[]> =>
    USE_MOCK ? mockApi.getDepartments() : http<Department[]>("/api/departments"),

  /** POST /api/departments */
  create: (payload: Omit<Department, "id">): Promise<Department> =>
    USE_MOCK
      ? mockApi.createDepartment(payload)
      : http<Department>("/api/departments", { method: "POST", body: JSON.stringify(payload) }),

  /** PUT /api/departments/{id} */
  update: (id: number, payload: Partial<Department>): Promise<Department> =>
    USE_MOCK
      ? mockApi.updateDepartment(id, payload)
      : http<Department>(`/api/departments/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  /** DELETE /api/departments/{id} */
  remove: (id: number): Promise<void> =>
    USE_MOCK ? mockApi.deleteDepartment(id) : http<void>(`/api/departments/${id}`, { method: "DELETE" }),
};
