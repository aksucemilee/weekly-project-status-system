import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/feedback/EmptyState";

type PlannedAdminModule = {
  title: string;
  description: string;
};

const plannedAdminModules: PlannedAdminModule[] = [
  {
    title: "Kullanıcı Yönetimi",
    description:
      "Kullanıcı oluşturma, kullanıcı bilgilerini görüntüleme ve aktiflik durumunu yönetme işlemleri.",
  },
  {
    title: "Rol Yönetimi",
    description:
      "Admin, proje yöneticisi ve CTO rollerinin tanımlanması ve kullanıcılara atanması.",
  },
  {
    title: "Proje Atamaları",
    description:
      "Projelerin sorumlu proje yöneticileriyle eşleştirilmesi ve atamaların takip edilmesi.",
  },
];

function AdminPage() {
  return (
    <Box>
      <PageHeader
        title="Admin Yönetimi"
        description="Kullanıcı, rol ve proje atama işlemlerinin yönetileceği merkezi alan."
      />

      <EmptyState
        label="Geliştirme planında"
        title="Admin özellikleri hazırlanıyor"
        description="Admin modülü sonraki geliştirme aşamalarında kullanıcı, rol ve proje atama işlevleriyle tamamlanacaktır."
      />

      <Box
        component="section"
        aria-labelledby="planned-admin-modules-title"
        sx={{
          mt: 4,
        }}
      >
        <Typography
          id="planned-admin-modules-title"
          variant="overline"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 0.5,
            fontWeight: 800,
          }}
        >
          Planlanan Modüller
        </Typography>

        <Typography variant="h5" component="h2" sx={{ mb: 2.5 }}>
          Admin kapsamı
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {plannedAdminModules.map((module) => (
            <Paper
              key={module.title}
              sx={{
                height: "100%",
                p: 3,
                boxShadow: "none",
                transition:
                  "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",

                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: "rgba(37, 99, 235, 0.28)",
                  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
                },
              }}
            >
              <Stack spacing={2}>
                <Chip
                  label="Planlandı"
                  size="small"
                  variant="outlined"
                  sx={{
                    alignSelf: "flex-start",
                  }}
                />

                <Typography variant="h6" component="h3">
                  {module.title}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.7,
                  }}
                >
                  {module.description}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminPage;
