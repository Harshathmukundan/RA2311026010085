"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Box, Container, Typography, Slider, Alert, ToggleButtonGroup, ToggleButton, Divider, Chip, Skeleton, Paper } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import Navbar from "@/components/Navbar";
import NotificationCard from "@/components/NotificationCard";
import { fetchNotifications, sendLog, getPriorityNotifications, Notification, NotificationType, TYPE_WEIGHT } from "@/lib/api";

const VIEWED_KEY = "viewed_notification_ids";
function getViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]")); }
  catch { return new Set(); }
}

export default function PriorityInboxPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [priorityList, setPriorityList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topN, setTopN] = useState(10);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      await sendLog("frontend", "info", "page", `Loading priority inbox topN=${topN}`);
      const data = await fetchNotifications({ notification_type: typeFilter || undefined });
      setAllNotifications(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      setError(msg);
      await sendLog("frontend", "error", "api", `Priority inbox fetch failed: ${msg}`);
    } finally { setLoading(false); }
  }, [typeFilter]);

  useEffect(() => { setViewedIds(getViewedIds()); }, []);
  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  useEffect(() => { setPriorityList(getPriorityNotifications(allNotifications, topN)); }, [allNotifications, topN]);

  const counts = { Placement: priorityList.filter((n) => n.Type === "Placement").length, Result: priorityList.filter((n) => n.Type === "Result").length, Event: priorityList.filter((n) => n.Type === "Event").length };
  const unreadCount = allNotifications.filter((n) => !viewedIds.has(n.ID)).length;
  const colors: Record<NotificationType, string> = { Placement: "#00E5A0", Result: "#6C63FF", Event: "#FFB347" };

  return (
    <Box sx={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar unreadCount={unreadCount} />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <StarIcon sx={{ color: "#FF6584", fontSize: 28 }} />
            <Typography variant="h4" sx={{ color: "#F0F0FF" }}>Priority Inbox</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#8888AA" }}>Top notifications ranked by importance (Placement &gt; Result &gt; Event) and recency</Typography>
        </Box>

        <Paper sx={{ p: 2, mb: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}>
          <Typography variant="caption" sx={{ color: "#8888AA", display: "block", mb: 1.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Priority Weights</Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {(["Placement", "Result", "Event"] as NotificationType[]).map((type) => (
              <Box key={type} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "8px", background: `${colors[type]}22`, border: `1px solid ${colors[type]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", color: colors[type] }}>{TYPE_WEIGHT[type]}</Box>
                <Typography variant="body2" sx={{ color: "#8888AA", fontWeight: 600 }}>{type}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ mb: 3, display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body2" sx={{ color: "#8888AA", mb: 1, fontWeight: 600 }}>
              Show top <Box component="span" sx={{ color: "#FF6584", fontWeight: 800 }}>{topN}</Box> notifications
            </Typography>
            <Slider value={topN} onChange={(_, val) => setTopN(val as number)} min={5} max={20} step={5}
              marks={[{ value: 5, label: "5" }, { value: 10, label: "10" }, { value: 15, label: "15" }, { value: 20, label: "20" }]}
              sx={{ color: "#FF6584", "& .MuiSlider-mark": { background: "#333355" }, "& .MuiSlider-markLabel": { color: "#555577" } }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#8888AA", mb: 1, fontWeight: 600 }}>Filter by type</Typography>
            <ToggleButtonGroup value={typeFilter} exclusive onChange={(_, val) => setTypeFilter(val ?? "")} size="small"
              sx={{ "& .MuiToggleButton-root": { borderRadius: "10px !important", textTransform: "none", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1) !important", color: "#8888AA", px: 1.5, "&.Mui-selected": { color: "#F0F0FF", background: "rgba(255,101,132,0.2)" } }, gap: 0.5 }}>
              <ToggleButton value="">All</ToggleButton>
              <ToggleButton value="Placement"><WorkIcon sx={{ fontSize: 14, mr: 0.5 }} />Placement</ToggleButton>
              <ToggleButton value="Result"><AssessmentIcon sx={{ fontSize: 14, mr: 0.5 }} />Result</ToggleButton>
              <ToggleButton value="Event"><EventIcon sx={{ fontSize: 14, mr: 0.5 }} />Event</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {!loading && priorityList.length > 0 && (
          <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
            {(["Placement", "Result", "Event"] as NotificationType[]).map((type) => counts[type] > 0 && (
              <Chip key={type} label={`${counts[type]} ${type}`} size="small" sx={{ background: `${colors[type]}11`, color: colors[type], border: `1px solid ${colors[type]}33`, fontWeight: 600 }} />
            ))}
          </Box>
        )}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}

        {loading ? Array.from({ length: topN > 10 ? 10 : topN }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.05)" }} />
        )) : priorityList.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <StarIcon sx={{ fontSize: 64, color: "#333355", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#555577" }}>No priority notifications found</Typography>
          </Box>
        ) : priorityList.map((n, i) => (
          <NotificationCard key={n.ID} notification={n} isNew={!viewedIds.has(n.ID)} rank={i + 1} />
        ))}
      </Container>
    </Box>
  );
}
