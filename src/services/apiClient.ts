/**
 * Central API client.
 *
 * Today every call is served by the in-memory mock layer (src/services/mockApi.ts)
 * so the whole UI is functional without a backend.
 *
 * To connect the Spring Boot backend later:
 *   1. Set VITE_API_BASE_URL (e.g. http://localhost:8080)
 *   2. Set USE_MOCK to false below (or VITE_USE_MOCK="false")
 * The endpoint paths in the service files already match the REST contract.
 */
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8080";

export const USE_MOCK = (import.meta.env["VITE_USE_MOCK"] ?? "true") !== "false";

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API ${options.method ?? "GET"} ${path} failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Simulates realistic network latency for the mock layer. */
export const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
