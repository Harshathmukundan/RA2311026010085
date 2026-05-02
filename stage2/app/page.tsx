"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Box, Container, Typography, ToggleButtonGroup, ToggleButton, Alert, Pagination, Divider, Skeleton } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import Navbar from "@/components/Navbar";
import NotificationCard from "@/components/NotificationCard";
import { fetchNotifications, sendLog, Notification, NotificationType } from "@/lib/api";

const VIEWED_KEY = "viewed_notification_ids";
function getViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]")); }
  catch { return new Set(); }
}
function markAsViewed(ids: string[]) {
  if (typeof window === "undefined") return;
  const existing = getViewedIds();
  ids.forEach((id) => existing.add(id));
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...existing]));
}

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationType | "">("");
  const [page, setPage] = useState(1);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      await sendLog("frontend", "info", "page", `Loading all notifications page=${page} type=${filter || "all"}`);
      const data = await fetchNotifications({ limit: 10, page, notification_type: filter || undefined });
      setNotifications(data);
      setTimeout(() => { markAsViewed(data.map((n) => n.ID)); setViewedIds(getViewedIds()); }, 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      setError(msg);
      await sendLog("frontend", "error", "api", `Failed to fetch: ${msg}`);
    } finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { setViewedIds(getViewedIds()); }, []);
  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const newOnes = notifications.filter((n) => !viewedIds.has(n.ID));
  const oldOnes = notifications.filter((n) => viewedIds.has(n.ID));
  const unreadCount = newOnes.length;

  return (
    <Box sx={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar unreadCount={unreadCount} />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <AllInboxIcon sx={{ color: "#6C63FF", fontSize: 28 }} />
            <Typography variant="h4" sx={{ color: "#F0F0FF" }}>All Notifications</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#8888AA" }}>Stay up to date with placements, results, and campus events</Typography>
        </Box>

        <ToggleButtonGroup value={filter} exclusive onChange={(_, val) => { setFilter(val ?? ""); setPage(1); }} size="small"
          sx={{ mb: 3, "& .MuiToggleButton-root": { borderRadius: "10px !important", textTransform: "none", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1) !important", color: "#8888AA", px: 2, "&.Mui-selected": { color: "#F0F0FF", background: "rgba(108,99,255,0.2)" } }, gap: 1 }}>
          <ToggleButton value="">All</ToggleButton>
          <ToggleButton value="Placement"><WorkIcon sx={{ fontSize: 16, mr: 0.5 }} />Placement</ToggleButton>
          <ToggleButton value="Result"><AssessmentIcon sx={{ fontSize: 16, mr: 0.5 }} />Result</ToggleButton>
          <ToggleButton value="Event"><EventIcon sx={{ fontSize: 16, mr: 0.5 }} />Event</ToggleButton>
        </ToggleButtonGroup>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}

        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.05)" }} />
        )) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AllInboxIcon sx={{ fontSize: 64, color: "#333355", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#555577" }}>No notifications found</Typography>
          </Box>
        ) : (
          <>
            {newOnes.length > 0 && (
              <>
                <Typography variant="caption" sx={{ color: "#6C63FF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1, display: "block" }}>New</Typography>
                {newOnes.map((n) => <NotificationCard key={n.ID} notification={n} isNew={true} />)}
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2 }} />
                <Typography variant="caption" sx={{ color: "#555577", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1, display: "block" }}>Earlier</Typography>
              </>
            )}
            {oldOnes.map((n) => <NotificationCard key={n.ID} notification={n} isNew={false} />)}
          </>
        )}

        {!loading && notifications.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination count={3} page={page} onChange={(_, val) => setPage(val)} color="primary"
              sx={{ "& .MuiPaginationItem-root": { borderRadius: "10px", color: "#8888AA", "&.Mui-selected": { background: "linear-gradient(135deg, #6C63FF, #9B94FF)", color: "#fff" } } }} />
          </Box>
        )}
      </Container>
    </Box>
  );
}
