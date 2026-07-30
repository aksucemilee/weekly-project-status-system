import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import PageHeader from "../components/common/PageHeader";
import BackendStatus from "../components/dashboard/BackendStatus";

const completedFeatures = [
  "Proje oluşturma ve listeleme",
  "Haftalık rapor oluşturma",
  "Frontend ve backend validasyonları",
  "Merkezi hata yönetimi",
];

const plannedFeatures = [
  "İş kalemi yönetimi",
  "Risk ve engel kayıtları",
  "Rol bazlı yetkilendirme",
  "CTO özet kartları ve filtreler",
];

function DashboardPage() {
  return (
    <Box>
      <PageHeader
        title="Dashboard"
        description="Sistemin çalışma durumunu, tamamlanan özellikleri ve sonraki geliştirme adımlarını tek ekrandan takip edin."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.1fr) minmax(340px, 0.9fr)",
          },
          gap: 3,
        }}
      >
        <BackendStatus />

        <Paper
          sx={{
            height: "100%",
            p: 3,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 800 }}
          >
            Mevcut Kapsam
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            sx={{
              mt: 0.5,
              mb: 1,
            }}
          >
            Çalışan Özellikler
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 3,
              lineHeight: 1.7,
            }}
          >
            Temel proje ve haftalık rapor akışı frontend, backend ve PostgreSQL
            birlikte çalışacak şekilde tamamlandı.
          </Typography>

          <Stack
            spacing={1}
            useFlexGap
            sx={{
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {completedFeatures.map((feature) => (
              <Chip
                key={feature}
                label={feature}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Paper>
      </Box>

      <Paper
        sx={{
          p: 3,
          mt: 3,
        }}
      >
        <Stack
          spacing={3}
          sx={{
            flexDirection: {
              xs: "column",
              md: "row",
            },
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ maxWidth: 620 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 800 }}
            >
              Yol Haritası
            </Typography>

            <Typography
              variant="h5"
              component="h2"
              sx={{
                mt: 0.5,
                mb: 1,
              }}
            >
              Sonraki Geliştirme Alanları
            </Typography>

            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Mevcut temel akış korunarak aşağıdaki özellikler sonraki
              geliştirme adımlarında sisteme eklenecektir.
            </Typography>
          </Box>

          <Stack
            spacing={1}
            useFlexGap
            sx={{
              maxWidth: 620,
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {plannedFeatures.map((feature) => (
              <Chip key={feature} label={feature} variant="outlined" />
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default DashboardPage;
