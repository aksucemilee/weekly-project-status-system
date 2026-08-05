import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import PageHeader from "../components/common/PageHeader";
import ResponsiveCardGrid from "../components/common/ResponsiveCardGrid";
import BackendStatus from "../components/dashboard/BackendStatus";
import { layoutTokens } from "../theme/layoutTokens";

type DevelopmentArea = {
  label: string;
  value: string;
  description: string;
};

const developmentAreas: DevelopmentArea[] = [
  {
    label: "Temel modüller",
    value: "4",
    description: "Proje, haftalık rapor, iş kalemi ve risk/engel yönetimi",
  },
  {
    label: "Arayüz deneyimi",
    value: "Hazır",
    description: "Responsive kartlar, Dialog formları ve açık/koyu tema",
  },
  {
    label: "API akışı",
    value: "Entegre",
    description:
      "React servisleri, Spring Boot API ve PostgreSQL birlikte çalışıyor",
  },
];

const completedFeatures = [
  "Proje oluşturma ve kart görünümü",
  "Haftalık rapor oluşturma ve detay sekmeleri",
  "İş kalemi oluşturma, düzenleme ve silme",
  "Risk/engel oluşturma, düzenleme ve silme",
  "Frontend ve backend validasyonları",
  "Merkezi API hata yönetimi",
  "Responsive light/dark tema",
  "Loading, empty, error ve success durumları",
];

const nextDevelopmentSteps = [
  "Rol bazlı giriş ve yetkilendirme",
  "CTO özet kartları, filtreler ve salt okunur detay",
  "Admin kullanıcı, rol ve proje atamaları",
  "Test kayıtları, deployment ve smoke test kanıtı",
];

function DashboardPage() {
  return (
    <Box>
      <PageHeader
        title="Dashboard"
        description="Uygulamanın güncel geliştirme durumunu, çalışan modülleri ve sıradaki MVP adımlarını tek ekrandan takip edin."
      />

      <Box sx={{ mb: layoutTokens.spacing.section }}>
        <ResponsiveCardGrid variant="metrics">
          {developmentAreas.map((area) => (
            <Paper
              key={area.label}
              sx={{
                height: "100%",
                p: {
                  xs: 2,
                  md: 2.25,
                },
                boxShadow: "none",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800 }}
              >
                {area.label}
              </Typography>

              <Typography
                variant="h5"
                color="primary.main"
                sx={{
                  mt: 0.5,
                  mb: 0.75,
                }}
              >
                {area.value}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {area.description}
              </Typography>
            </Paper>
          ))}
        </ResponsiveCardGrid>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
          },
          gap: layoutTokens.spacing.cardGrid,
        }}
      >
        <BackendStatus />

        <Paper
          sx={{
            height: "100%",
            minWidth: 0,
            p: {
              xs: 2.25,
              md: 3,
            },
          }}
        >
          <Typography
            variant="overline"
            color="primary.main"
            sx={{ fontWeight: 900 }}
          >
            Tamamlanan kapsam
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            sx={{
              mt: 0.25,
              mb: 1,
            }}
          >
            Çalışan özellikler
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 2.5,
              lineHeight: 1.7,
            }}
          >
            Proje ve rapor yönetimi; iş kalemi ve risk detaylarıyla birlikte
            gerçek API üzerinden çalışacak duruma getirildi.
          </Typography>

          <Stack
            useFlexGap
            sx={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 1,
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
        component="section"
        sx={{
          p: {
            xs: 2.25,
            md: 3,
          },
          mt: layoutTokens.spacing.section,
        }}
      >
        <Stack
          spacing={3}
          sx={{
            flexDirection: {
              xs: "column",
              lg: "row",
            },
            alignItems: {
              xs: "flex-start",
              lg: "center",
            },
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ maxWidth: 600 }}>
            <Typography
              variant="overline"
              color="warning.main"
              sx={{ fontWeight: 900 }}
            >
              Sıradaki adımlar
            </Typography>

            <Typography
              variant="h5"
              component="h2"
              sx={{
                mt: 0.25,
                mb: 1,
              }}
            >
              MVP'nin kalan geliştirme alanları
            </Typography>

            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Mevcut CRUD ve arayüz yapısı korunarak bundan sonraki aşamada
              kullanıcı rolleri, CTO görünümü ve teslim doğrulamaları
              tamamlanacaktır.
            </Typography>
          </Box>

          <Stack
            useFlexGap
            sx={{
              maxWidth: 680,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {nextDevelopmentSteps.map((feature) => (
              <Chip key={feature} label={feature} variant="outlined" />
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default DashboardPage;
