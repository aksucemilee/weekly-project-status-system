import { Box } from "@mui/material";
import type { ReactNode } from "react";

import { layoutTokens } from "../../theme/layoutTokens";

type ResponsiveCardGridVariant = "standard" | "compact" | "metrics" | "summary";

type ResponsiveCardGridProps = {
  children: ReactNode;
  variant?: ResponsiveCardGridVariant;
};

const gridTemplates = {
  standard: layoutTokens.grids.cards,
  compact: layoutTokens.grids.compactCards,
  metrics: layoutTokens.grids.metrics,
  summary: layoutTokens.grids.summary,
} as const;

function ResponsiveCardGrid({
  children,
  variant = "standard",
}: ResponsiveCardGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: gridTemplates[variant],
        gap: layoutTokens.spacing.cardGrid,
      }}
    >
      {children}
    </Box>
  );
}

export default ResponsiveCardGrid;
