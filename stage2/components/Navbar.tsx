"use client";
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  unreadCount?: number;
}

export default function Navbar({ unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AppBar position="sticky" elevation={0}
      sx={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <NotificationsIcon sx={{ fontSize: 20, color: "#fff" }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, background: "linear-gradient(135deg, #6C63FF, #FF6584)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>
            CampusNotify
          </Typography>
        </Box>
        <Button
          startIcon={<Badge badgeContent={unreadCount} color="error" max={99}><NotificationsIcon /></Badge>}
          onClick={() => router.push("/")}
          variant={pathname === "/" ? "contained" : "text"}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600, ...(pathname === "/" ? { background: "linear-gradient(135deg, #6C63FF, #9B94FF)" } : { color: "#8888AA" }) }}
        >
          All Notifications
        </Button>
        <Button
          startIcon={<StarIcon />}
          onClick={() => router.push("/priority-inbox")}
          variant={pathname === "/priority-inbox" ? "contained" : "text"}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600, ...(pathname === "/priority-inbox" ? { background: "linear-gradient(135deg, #FF6584, #FFB347)" } : { color: "#8888AA" }) }}
        >
          Priority Inbox
        </Button>
      </Toolbar>
    </AppBar>
  );
}
