export const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyczU0ODVAc3JtaXN0LmVkdSIsImV4cCI6MTc3NzcwNjE5MCwiaWF0IjoxNzc3NzA1MjkwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZTZlODFlMzMtY2NjNS00OGVkLWE3NmYtNjExNDFiZTk1ODc0IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2hhdGggbXVrdW5kYW4iLCJzdWIiOiJhMTg4YzczMS0yYjNjLTRhYjMtYWIwMy0zOTZhMjFlNDM3ZmQifSwiZW1haWwiOiJyczU0ODVAc3JtaXN0LmVkdSIsIm5hbWUiOiJoYXJzaGF0aCBtdWt1bmRhbiIsInJvbGxObyI6InJhMjMxMTAyNjAxMDA4NSIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6ImExODhjNzMxLTJiM2MtNGFiMy1hYjAzLTM5NmEyMWU0MzdmZCIsImNsaWVudFNlY3JldCI6IlFwblhDWWJhdUt2V0padVYifQ.QgpZdrITHJCcYLbfcW01fwMw-LsjjCqalFS2ls75xIg";
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyczU0ODVAc3JtaXN0LmVkdSIsImV4cCI6MTc3NzcwNDkwNiwiaWF0IjoxNzc3NzA0MDA2LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiN2YyYjNkNDgtODM5Yi00ZTUxLThhYmItM2ViMjg0MTk1Y2FhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2hhdGggbXVrdW5kYW4iLCJzdWIiOiJhMTg4YzczMS0yYjNjLTRhYjMtYWIwMy0zOTZhMjFlNDM3ZmQifSwiZW1haWwiOiJyczU0ODVAc3JtaXN0LmVkdSIsIm5hbWUiOiJoYXJzaGF0aCBtdWt1bmRhbiIsInJvbGxObyI6InJhMjMxMTAyNjAxMDA4NSIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6ImExODhjNzMxLTJiM2MtNGFiMy1hYjAzLTM5NmEyMWU0MzdmZCIsImNsaWVudFNlY3JldCI6IlFwblhDWWJhdUt2V0padVYifQ.WTegc6xk_9AMihOQY9bJweyVdSMP-p9c4bKNrjrkGNc";

const BASE_URL = "/api/proxy";

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface FetchNotificationsParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType | "";
}

export const TYPE_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function scoreNotification(n: Notification): number {
  return TYPE_WEIGHT[n.Type] * 1e12 + new Date(n.Timestamp).getTime();
}

export async function fetchNotifications(
  params: FetchNotificationsParams = {}
): Promise<Notification[]> {
  const url = new URL("/api/proxy/notifications", window.location.origin);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.notification_type)
    url.searchParams.set("notification_type", params.notification_type);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`);
  const data = await res.json();
  return data.notifications ?? [];
}

export async function sendLog(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  try {
    await fetch("/api/proxy/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch {
    // silent fail
  }
}

export function getPriorityNotifications(
  notifications: Notification[],
  topN: number
): Notification[] {
  return [...notifications]
    .sort((a, b) => scoreNotification(b) - scoreNotification(a))
    .slice(0, topN);
}

export function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
