"use client";
import React from "react";
import { Card, CardContent, Box, Typography, Chip, Tooltip } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import { Notification, formatTimestamp } from "@/lib/api";

interface NotificationCardProps {
  notification: Notification;
  isNew: boolean;
  rank?: number;
}

const TYPE_CONFIG = {
  Placement: { icon: WorkIcon, color: "#00E5A0", bg: "rgba(0,229,160,0.08)", border: "rgba(0,229,160,0.2)", label: "Placement" },
  Result: { icon: AssessmentIcon, color: "#6C63FF", bg: "rgba(108,99,255,0.08)", border: "rgba(108,99,255,0.2)", label: "Result" },
  Event: { icon: EventIcon, color: "#FFB347", bg: "rgba(255,179,71,0.08)", border: "rgba(255,179,71,0.2)", label: "Event" },
};

export default function NotificationCard({ notification, isNew, rank }: NotificationCardProps) {
  const config = TYPE_CONFIG[notification.Type];
  const Icon = config.icon;

  return (
    <Card sx={{
      mb: 1.5,
      background: isNew ? `linear-gradient(135deg, ${config.bg}, rgba(19,19,26,0.9))` : "rgba(19,19,26,0.6)",
      border: isNew ? `1px solid ${config.border}` : "1px solid rgba(255,255,255,0.05)",
      transition: "all 0.2s ease",
      "&:hover": { transform: "translateY(-2px)", boxShadow: isNew ? `0 8px 32px ${config.bg}` : "0 8px 32px rgba(0,0,0,0.3)", border: `1px solid ${config.border}` },
    }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          {rank !== undefined ? (
            <Box sx={{ minWidth: 36, height: 36, borderRadius: "10px", background: `linear-gradient(135deg, ${config.color}22, ${config.color}44)`, border: `1px solid ${config.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", color: config.color }}>
              #{rank}
            </Box>
          ) : (
            <Box sx={{ minWidth: 36, height: 36, borderRadius: "10px", background: config.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon sx={{ fontSize: 20, color: config.color }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
              <Chip label={config.label} size="small" sx={{ background: config.bg, color: config.color, border: `1px solid ${config.border}`, height: 22, fontSize: "0.7rem" }} />
              {isNew && <Chip icon={<FiberNewIcon sx={{ fontSize: "14px !important" }} />} label="New" size="small" color="error" sx={{ height: 22, fontSize: "0.7rem" }} />}
            </Box>
            <Typography variant="body1" sx={{ fontWeight: isNew ? 600 : 400, color: isNew ? "#F0F0FF" : "#8888AA", fontSize: "0.95rem", mb: 0.5, textTransform: "capitalize" }}>
              {notification.Message}
            </Typography>
            <Tooltip title={notification.Timestamp} placement="bottom-start">
              <Typography variant="caption" sx={{ color: "#555577", cursor: "default" }}>
                {formatTimestamp(notification.Timestamp)}
              </Typography>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
