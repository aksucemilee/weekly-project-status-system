import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Stack
      spacing={2}
      sx={{
        mb: 4,
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        alignItems: {
          xs: "flex-start",
          sm: "center",
        },
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ maxWidth: 760 }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 44,
            height: 4,
            mb: 1.5,
            borderRadius: 999,
            background: "linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)",
          }}
        />

        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          {title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 680,
            lineHeight: 1.7,
          }}
        >
          {description}
        </Typography>
      </Box>

      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  );
}

export default PageHeader;
