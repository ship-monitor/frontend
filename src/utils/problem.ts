// Бэкенд возвращает ошибки в формате RFC 9457 (application/problem+json):
// { type, title, status, detail }.
export const problemDetails = (data: unknown, fallback: string): string => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const detail = record["detail"];
    if (typeof detail === "string" && detail.length > 0) return detail;
    const title = record["title"];
    if (typeof title === "string" && title.length > 0) return title;
  }
  return fallback;
};
