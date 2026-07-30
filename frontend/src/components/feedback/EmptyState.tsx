import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  label?: string;
  action?: ReactNode;
};

function EmptyState({
  title,
  description,
  label = "Yakında",
  action,
}: EmptyStateProps) {
  return (
    <Paper
      sx={{
        p: {
          xs: 3,
          md: 5,
        },
        textAlign: "center",
        borderStyle: "dashed",
        boxShadow: "none",
      }}
    >
      <Stack
        spacing={2}
        sx={{
          maxWidth: 620,
          mx: "auto",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            color: "primary.main",
            backgroundColor: "rgba(37, 99, 235, 0.08)",
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Box>

        <Typography variant="h5" component="h2">
          {title}
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {description}
        </Typography>

        {action ? <Box>{action}</Box> : null}
      </Stack>
    </Paper>
  );
}

export default EmptyState;
