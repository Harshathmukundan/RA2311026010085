const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyczU0ODVAc3JtaXN0LmVkdSIsImV4cCI6MTc3NzcwMjUwMiwiaWF0IjoxNzc3NzAxNjAyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZDMwYmJkZDAtNzFhMS00MDc0LWFmMzgtYWRmOGMwN2RhMDU5IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2hhdGggbXVrdW5kYW4iLCJzdWIiOiJhMTg4YzczMS0yYjNjLTRhYjMtYWIwMy0zOTZhMjFlNDM3ZmQifSwiZW1haWwiOiJyczU0ODVAc3JtaXN0LmVkdSIsIm5hbWUiOiJoYXJzaGF0aCBtdWt1bmRhbiIsInJvbGxObyI6InJhMjMxMTAyNjAxMDA4NSIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6ImExODhjNzMxLTJiM2MtNGFiMy1hYjAzLTM5NmEyMWU0MzdmZCIsImNsaWVudFNlY3JldCI6IlFwblhDWWJhdUt2V0padVYifQ.b9ZB5ZuUHGttU22t4fj8qsQNnRv2Pyl69JBOhSBFxs0";
const LOG_URL = "http://20.207.122.201/evaluation-service/logs";
const NOTIF_URL = "http://20.207.122.201/evaluation-service/notifications";
const TOP_N = 10;

const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

async function Log(stack, level, pkg, message) {
  try {
    const res = await fetch(LOG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
    const data = await res.json();
    console.log(`[LOG ${level.toUpperCase()}] ${message} → ${res.status} ${JSON.stringify(data)}`);
  } catch (e) {
    console.error("[LOG ERROR]", e.message);
  }
}

function score(n) {
  return TYPE_WEIGHT[n.Type] * 1e12 + new Date(n.Timestamp).getTime();
}

async function main() {
  await Log("backend", "info", "service", "Fetching notifications from evaluation API");

  const res = await fetch(NOTIF_URL, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (!res.ok) {
    await Log("backend", "error", "service", `Failed to fetch notifications: HTTP ${res.status}`);
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  const notifications = data.notifications ?? [];

  await Log("backend", "info", "service", `Successfully fetched ${notifications.length} notifications`);

  const sorted = notifications.sort((a, b) => score(b) - score(a));
  const top = sorted.slice(0, TOP_N);

  await Log("backend", "info", "handler", `Returning top ${top.length} priority notifications`);

  console.log(`\nPriority Inbox — Top ${TOP_N}\n${"=".repeat(60)}`);
  top.forEach((n, i) => {
    const emoji = n.Type === "Placement" ? "" : n.Type === "Result" ? "" : "";
    console.log(`${i + 1}. ${emoji} [${n.Type}] ${n.Message}`);
    console.log(`   ${n.Timestamp}  |  ID: ${n.ID}\n`);
  });
}

main().catch(console.error);
