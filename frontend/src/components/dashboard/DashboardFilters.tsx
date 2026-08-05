import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { FormEvent } from "react";

import type { Project } from "../../types/project";
import type { GeneralStatus, RiskLevel } from "../../types/weeklyReport";
import {
  generalStatusLabels,
  riskLevelLabels,
} from "../reports/reportPresentation";

export type DashboardFilterForm = {
  weekStart: string;
  projectId: string;
  generalStatus: "" | GeneralStatus;
  riskLevel: "" | RiskLevel;
};

type DashboardFiltersProps = {
  projects: Project[];
  filters: DashboardFilterForm;
  appliedFilters: DashboardFilterForm;
  isLoading: boolean;
  onChange: (filters: DashboardFilterForm) => void;
  onApply: () => void;
  onClear: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function countActiveFilters(filters: DashboardFilterForm) {
  return Object.values(filters).filter(Boolean).length;
}

function getWeekHelperText(weekStart: string) {
  if (!weekStart) {
    return "Tarih seçilmezse her projenin en güncel raporu gösterilir.";
  }

  const startDate = new Date(`${weekStart}T00:00:00`);

  if (Number.isNaN(startDate.getTime())) {
    return "Geçerli bir hafta başlangıcı seçin.";
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return `${dateFormatter.format(startDate)} – ${dateFormatter.format(
    endDate,
  )} tarih aralığı değerlendirilir.`;
}

function DashboardFilters({
  projects,
  filters,
  appliedFilters,
  isLoading,
  onChange,
  onApply,
  onClear,
}: DashboardFiltersProps) {
  const updateField = <K extends keyof DashboardFilterForm>(
    field: K,
    value: DashboardFilterForm[K],
  ) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const selectedFilterCount = countActiveFilters(filters);
  const appliedFilterCount = countActiveFilters(appliedFilters);

  const hasUnappliedChanges =
    JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  const hasAnyFilter = selectedFilterCount > 0 || appliedFilterCount > 0;

  const activeProjects = projects.filter((project) => project.active);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoading && hasUnappliedChanges) {
      onApply();
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      aria-busy={isLoading}
      sx={{
        p: {
          xs: 2,
          md: 2.5,
        },
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
          mb: 2.25,
        }}
      >
        <Box>
          <Typography variant="h6" component="h2">
            Dashboard filtreleri
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            Projeleri hafta, proje, genel durum ve risk seviyesine göre
            daraltın.
          </Typography>
        </Box>

        {hasUnappliedChanges ? (
          <Chip
            label="Değişiklikler uygulanmadı"
            color="warning"
            size="small"
            variant="outlined"
          />
        ) : appliedFilterCount > 0 ? (
          <Chip
            label={`${appliedFilterCount} filtre uygulanıyor`}
            color="primary"
            size="small"
            variant="outlined"
          />
        ) : (
          <Chip label="Tüm projeler" size="small" variant="outlined" />
        )}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <TextField
          label="Hafta başlangıcı"
          type="date"
          value={filters.weekStart}
          onChange={(event) => updateField("weekStart", event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          helperText={getWeekHelperText(filters.weekStart)}
          fullWidth
        />

        <TextField
          select
          label="Proje"
          value={filters.projectId}
          onChange={(event) => updateField("projectId", event.target.value)}
          fullWidth
        >
          <MenuItem value="">Tüm projeler</MenuItem>

          {activeProjects.map((project) => (
            <MenuItem key={project.id} value={String(project.id)}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>

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
          fullWidth
        >
          <MenuItem value="">Tüm risk seviyeleri</MenuItem>

          {Object.entries(riskLevelLabels).map(([riskLevel, label]) => (
            <MenuItem key={riskLevel} value={riskLevel}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Stack
        sx={{
          mt: 2.25,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          gap: 1,
        }}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !hasUnappliedChanges}
          sx={{
            minWidth: 150,
          }}
        >
          {isLoading ? "Uygulanıyor..." : "Filtreleri uygula"}
        </Button>

        <Button
          type="button"
          variant="text"
          disabled={isLoading || !hasAnyFilter}
          onClick={onClear}
        >
          Filtreleri temizle
        </Button>

        {selectedFilterCount > 0 && hasUnappliedChanges && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              ml: {
                sm: "auto",
              },
            }}
          >
            {selectedFilterCount} seçim uygulanmayı bekliyor
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default DashboardFilters;
