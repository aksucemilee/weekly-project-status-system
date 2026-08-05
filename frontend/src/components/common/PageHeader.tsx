import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Paper
      component="header"
      sx={(theme) => ({
        position: "relative",
        overflow: "hidden",
        mb: 3,
        p: {
          xs: 2.5,
          md: 3.25,
        },
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          theme.palette.mode === "light" ? 0.1 : 0.16,
        )} 0%, ${alpha(
          theme.palette.secondary.main,
          theme.palette.mode === "light" ? 0.06 : 0.12,
        )} 100%)`,
      })}
    >
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          position: "absolute",
          width: 180,
          height: 180,
          right: -70,
          top: -100,
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        })}
      />

      <Stack
        spacing={2}
        sx={{
          position: "relative",
          zIndex: 1,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Typography
            variant="overline"
            color="primary.main"
            sx={{
              display: "block",
              mb: 0.25,
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}
          >
            Proje Yönetimi
          </Typography>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 1,
              fontSize: {
                xs: "1.75rem",
                sm: "2.125rem",
              },
            }}
          >
            {title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
              lineHeight: 1.65,
            }}
          >
            {description}
          </Typography>
        </Box>

        {action ? (
          <Box
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              flexShrink: 0,
            }}
          >
            {action}
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

export default PageHeader;
