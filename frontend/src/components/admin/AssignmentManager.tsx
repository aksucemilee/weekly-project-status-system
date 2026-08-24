import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createAssignment,
  getAssignmentsByUser,
  updateAssignment,
} from "../../services/adminService";
import { getProjects } from "../../services/projectService";
import type { AdminUser, AssignmentRole, ProjectAssignment } from "../../types/admin";
import { assignmentRoleLabels } from "../../types/admin";
import type { Project } from "../../types/project";
import EmptyState from "../feedback/EmptyState";

type AssignmentManagerProps = {
  user: AdminUser;
  onNotify: (message: string) => void;
};

/**
 * Bir kullanicinin proje atamalarini yonetir.
 *
 * Kapsam (sahiplik) kontrolu bu atamalara dayandigi icin, bir proje
 * yoneticisi ancak burada bir projeye atandiktan sonra o projede islem
 * yapabilir.
 *
 * Not: backend yalnizca AKTIF atamalari donduruyor; bir atama pasife
 * alindiginda listeden cikar.
 */
function AssignmentManager({ user, onNotify }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<AssignmentRole>("PROJE_YONETICISI");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");

  const [updatingAssignmentId, setUpdatingAssignmentId] = useState<
    number | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [assignmentList, projectList] = await Promise.all([
          getAssignmentsByUser(user.id),
          getProjects(),
        ]);

        if (!cancelled) {
          setAssignments(assignmentList);
          setProjects(projectList);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("Atama bilgileri yüklenirken bir hata oluştu.");
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
  }, [user.id, reloadToken]);

  const assignedProjectIds = new Set(
    assignments.map((assignment) => assignment.projectId),
  );

  const assignableProjects = projects.filter(
    (project) => !assignedProjectIds.has(project.id),
  );

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedProjectId) {
      return;
    }

    setFormErrorMessage("");
    setIsSubmitting(true);

    try {
      await createAssignment({
        projectId: Number(selectedProjectId),
        userId: user.id,
        assignmentRole: selectedRole,
      });

      setSelectedProjectId("");
      setReloadToken((token) => token + 1);
      onNotify("Proje ataması oluşturuldu.");
    } catch (error) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } })
          .response?.data?.message === "string"
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : "";

      setFormErrorMessage(
        apiMessage || "Atama oluşturulurken bir hata oluştu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (assignment: ProjectAssignment) => {
    setUpdatingAssignmentId(assignment.id);

    try {
      await updateAssignment(assignment.id, {
        assignmentRole: assignment.assignmentRole,
        active: false,
      });

      setReloadToken((token) => token + 1);
      onNotify("Atama pasife alındı.");
    } catch {
      setErrorMessage("Atama güncellenirken bir hata oluştu.");
    } finally {
      setUpdatingAssignmentId(null);
    }
  };

  return (
    <Paper
      component="section"
      sx={{
        p: {
          xs: 1.75,
          md: 2.5,
        },
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" component="h2">
            Proje atamaları
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.25 }}>
            {user.firstName} {user.lastName} ({user.email})
          </Typography>
        </Box>

        {errorMessage && (
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
        )}

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 1.5,
              md: 2,
            },
          }}
        >
          <Stack component="form" spacing={2} onSubmit={handleCreate}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Yeni atama
            </Typography>

            {formErrorMessage && (
              <Alert severity="error">{formErrorMessage}</Alert>
            )}

            <Stack
              useFlexGap
              sx={{
                // spacing yerine gap: flexDirection sx uzerinden verildigi
                // icin Stack'in spacing prop'u satir yonunde bosluk uretmez,
                // bunun yerine ust margin ekleyip alanlari kaydirir.
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "stretch", md: "flex-start" },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Proje"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                disabled={isSubmitting || isLoading}
                helperText={
                  assignableProjects.length === 0
                    ? "Atanabilecek başka proje yok."
                    : undefined
                }
                fullWidth
              >
                {assignableProjects.map((project) => (
                  <MenuItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Atama rolü"
                value={selectedRole}
                onChange={(event) =>
                  setSelectedRole(event.target.value as AssignmentRole)
                }
                disabled={isSubmitting || isLoading}
                fullWidth
              >
                {Object.entries(assignmentRoleLabels).map(([code, label]) => (
                  <MenuItem key={code} value={code}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || isLoading || !selectedProjectId}
                sx={{
                  flexShrink: 0,
                  minHeight: 56,
                  px: 3,
                }}
              >
                Ata
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {isLoading && (
          <Box sx={{ display: "grid", placeItems: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!isLoading && assignments.length === 0 && (
          <EmptyState
            label="Atama yok"
            title="Bu kullanıcının aktif proje ataması yok"
            description="Proje yöneticisi ve ekip lideri yalnızca atandıkları projelerde işlem yapabilir. Yukarıdaki formdan atama ekleyebilirsiniz."
          />
        )}

        {!isLoading && assignments.length > 0 && (
          <Stack spacing={1.25}>
            {assignments.map((assignment) => (
              <Paper
                key={assignment.id}
                variant="outlined"
                sx={{
                  p: 1.75,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  gap: 1.5,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                    {assignment.projectName}
                  </Typography>

                  <Chip
                    label={assignmentRoleLabels[assignment.assignmentRole]}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.75 }}
                  />
                </Box>

                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={updatingAssignmentId !== null}
                  onClick={() => void handleDeactivate(assignment)}
                  sx={{ flexShrink: 0 }}
                >
                  Pasife al
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default AssignmentManager;
