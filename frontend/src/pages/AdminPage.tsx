import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";

import AssignmentManager from "../components/admin/AssignmentManager";
import UserFormDialog from "../components/admin/UserFormDialog";
import PageHeader from "../components/common/PageHeader";
import ResponsiveCardGrid from "../components/common/ResponsiveCardGrid";
import EmptyState from "../components/feedback/EmptyState";
import { useNotification } from "../components/feedback/NotificationProvider";
import { getUsers } from "../services/adminService";
import { layoutTokens } from "../theme/layoutTokens";
import type { AdminUser } from "../types/admin";
import { roleLabels } from "../types/admin";

function AdminPage() {
  const theme = useTheme();
  const { showNotification } = useNotification();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const assignmentSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const userList = await getUsers();

        if (!cancelled) {
          setUsers(userList);

          // Secili kullanici guncellendiyse karti tazele.
          setSelectedUser((current) =>
            current
              ? userList.find((user) => user.id === current.id) ?? null
              : null,
          );
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("Kullanıcılar yüklenirken bir hata oluştu.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSaved = (user: AdminUser, isNew: boolean) => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setReloadToken((token) => token + 1);

    showNotification(
      isNew
        ? "Kullanıcı başarıyla oluşturuldu."
        : "Kullanıcı bilgileri güncellendi.",
    );

    if (isNew) {
      setSelectedUser(user);
    }
  };

  const handleManageAssignments = (user: AdminUser) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
      return;
    }

    setSelectedUser(user);

    window.setTimeout(() => {
      assignmentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <Box>
      <PageHeader
        title="Admin Yönetimi"
        description="Kullanıcı tanımlama ve proje atama işlemleri."
        action={
          <Button
            variant="contained"
            onClick={handleOpenCreate}
            fullWidth={isSmallScreen}
          >
            + Yeni kullanıcı
          </Button>
        }
      />

      {isLoading && (
        <Paper
          sx={{
            minHeight: 220,
            display: "grid",
            placeItems: "center",
            p: 3,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress size={30} />

            <Typography color="text.secondary">
              Kullanıcılar yükleniyor...
            </Typography>
          </Stack>
        </Paper>
      )}

      {!isLoading && errorMessage && (
        <Paper sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setReloadToken((token) => token + 1)}
              >
                Tekrar dene
              </Button>
            }
          >
            {errorMessage}
          </Alert>
        </Paper>
      )}

      {!isLoading && !errorMessage && users.length === 0 && (
        <EmptyState
          label="Kullanıcı yok"
          title="Henüz kullanıcı tanımlanmamış"
          description="Sisteme giriş yapabilecek kullanıcıları buradan tanımlayabilirsiniz."
        />
      )}

      {!isLoading && !errorMessage && users.length > 0 && (
        <Stack sx={{ gap: layoutTokens.spacing.section }}>
          <Box component="section">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <Typography variant="h6" component="h2">
                Kullanıcılar
              </Typography>

              <Chip
                label={`${users.length} kullanıcı`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            <ResponsiveCardGrid variant="standard">
              {users.map((user) => {
                const isSelected = selectedUser?.id === user.id;

                return (
                  <Paper
                    key={user.id}
                    component="article"
                    variant="outlined"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                      p: {
                        xs: 1.75,
                        md: 2,
                      },
                      borderColor: isSelected ? "primary.main" : "divider",
                      backgroundColor: isSelected
                        ? "action.selected"
                        : "background.paper",
                      transition:
                        "border-color 160ms ease, background-color 160ms ease",

                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Stack spacing={1.5} sx={{ height: "100%" }}>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          component="h3"
                          sx={{
                            fontWeight: 800,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {user.firstName} {user.lastName}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          {user.email}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        useFlexGap
                        sx={{
                          flexWrap: "wrap",
                          gap: 0.75,
                        }}
                      >
                        <Chip
                          label={roleLabels[user.role]}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={user.active ? "Aktif" : "Pasif"}
                          color={user.active ? "success" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>

                      <Box sx={{ flexGrow: 1 }} />

                      <Stack
                        direction="row"
                        useFlexGap
                        sx={{
                          flexWrap: "wrap",
                          gap: 0.75,
                        }}
                      >
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenEdit(user)}
                        >
                          Düzenle
                        </Button>

                        <Button
                          type="button"
                          variant={isSelected ? "contained" : "outlined"}
                          size="small"
                          onClick={() => handleManageAssignments(user)}
                        >
                          {isSelected ? "Atamaları kapat" : "Atamalar"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </ResponsiveCardGrid>
          </Box>

          {selectedUser && (
            <Box
              ref={assignmentSectionRef}
              sx={{
                scrollMarginTop: 88,
              }}
            >
              <AssignmentManager
                key={`assignments-${selectedUser.id}`}
                user={selectedUser}
                onNotify={showNotification}
              />
            </Box>
          )}
        </Stack>
      )}

      {/*
        Dialog yalnizca acikken mount ediliyor: boylece form durumu her
        acilista sifirdan kurulur ve UserFormDialog icinde sifirlama
        amacli bir useEffect tutmaya gerek kalmaz.
      */}
      {isDialogOpen && (
        <UserFormDialog
          key={editingUser?.id ?? "new"}
          open
          user={editingUser}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingUser(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </Box>
  );
}

export default AdminPage;
