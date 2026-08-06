import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { layoutTokens } from "../../theme/layoutTokens";

type PageHeaderProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
};

function PageHeader({
  title,
  description,
  meta,
  action,
}: PageHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        mb: layoutTokens.spacing.pageHeader,
      }}
    >
      <Stack
        sx={{
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </Typography>

          {description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                maxWidth: 720,
                lineHeight: 1.6,
              }}
            >
              {description}
            </Typography>
          ) : null}
        </Box>

        {meta || action ? (
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
              gap: 1,
              flexShrink: 0,
            }}
          >
            {meta ? (
              <Typography
                component="div"
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 700,
                  whiteSpace: {
                    sm: "nowrap",
                  },
                }}
              >
                {meta}
              </Typography>
            ) : null}

            {action}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

export default PageHeader;