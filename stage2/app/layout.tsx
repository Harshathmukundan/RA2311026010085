"use client";
import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6C63FF" },
    secondary: { main: "#FF6584" },
    background: { default: "#0A0A0F", paper: "#13131A" },
    text: { primary: "#F0F0FF", secondary: "#8888AA" },
    success: { main: "#00E5A0" },
    warning: { main: "#FFB347" },
    error: { main: "#FF6B6B" },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundImage: "none", border: "1px solid rgba(255,255,255,0.06)" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, fontSize: "0.75rem" } } },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Campus Notifications</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
