import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

import type {
  GeneralStatus,
  RiskLevel,
  ScheduleStatus,
} from "../../types/weeklyReport";
import {
  emptyReportFilterForm,
  generalStatusLabels,
  hasActiveReportFilters,
  riskLevelLabels,
  scheduleStatusLabels,
} from "./reportPresentation";
import type { ReportFilterForm } from "./reportPresentation";

type ReportFiltersProps = {
  filters: ReportFilterForm;
  isLoading: boolean;
  onChange: (filters: ReportFilterForm) => void;
};

function ReportFilters({ filters, isLoading, onChange }: ReportFiltersProps) {
  const updateField = <K extends keyof ReportFilterForm>(
    field: K,
    value: ReportFilterForm[K],
  ) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const hasAnyFilter = hasActiveReportFilters(filters);

  return (
    <Paper
      component="section"
      aria-busy={isLoading}
      sx={{
        p: {
          xs: 1.75,
          md: 2,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          mb: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Rapor filtreleri
        </Typography>

        <Button
          type="button"
          variant="text"
          size="small"
          disabled={isLoading || !hasAnyFilter}
          onClick={() => onChange(emptyReportFilterForm)}
        >
          Temizle
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: {
            xs: 1.25,
            md: 1.5,
          },
        }}
      >
        <TextField
          label="Rapor haftası"
          type="date"
          value={filters.weekStart}
          onChange={(event) => updateField("weekStart", event.target.value)}
          disabled={isLoading}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          fullWidth
        />

        <TextField
          select
          label="Genel durum"
          value={filters.generalStatus}
          onChange={(event) =>
            updateField(
              "generalStatus",
              event.target.value as "" | GeneralStatus,
            )
          }
          disabled={isLoading}
          fullWidth
        >
          <MenuItem value="">Tüm durumlar</MenuItem>

          {Object.entries(generalStatusLabels).map(([status, label]) => (
            <MenuItem key={status} value={status}>
              {label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Risk seviyesi"
          value={filters.riskLevel}
          onChange={(event) =>
            updateField("riskLevel", event.target.value as "" | RiskLevel)
          }
          disabled={isLoading}
          fullWidth
        >
          <MenuItem value="">Tüm risk seviyeleri</MenuItem>

          {Object.entries(riskLevelLabels).map(([riskLevel, label]) => (
            <MenuItem key={riskLevel} value={riskLevel}>
              {label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Takvim durumu"
          value={filters.scheduleStatus}
          onChange={(event) =>
            updateField(
              "scheduleStatus",
              event.target.value as "" | ScheduleStatus,
            )
          }
          disabled={isLoading}
          fullWidth
        >
          <MenuItem value="">Tüm takvim durumları</MenuItem>

          {Object.entries(scheduleStatusLabels).map(
            ([scheduleStatus, label]) => (
              <MenuItem key={scheduleStatus} value={scheduleStatus}>
                {label}
              </MenuItem>
            ),
          )}
        </TextField>
      </Box>
    </Paper>
  );
}

export default ReportFilters;
