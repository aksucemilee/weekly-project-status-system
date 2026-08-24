import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { FormEvent } from "react";

import { createUser, updateUser } from "../../services/adminService";
import type { AdminUser } from "../../types/admin";
import { roleLabels } from "../../types/admin";
import type { RoleCode } from "../../types/auth";

type UserFormDialogProps = {
  open: boolean;
  /** null ise yeni kullanici olusturulur, dolu ise duzenlenir. */
  user: AdminUser | null;
  onClose: () => void;
  onSaved: (user: AdminUser, isNew: boolean) => void;
};

type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: RoleCode;
  active: boolean;
};

const emptyForm: UserForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "PROJE_YONETICISI",
  active: true,
};

function UserFormDialog({ open, user, onClose, onSaved }: UserFormDialogProps) {
  const isEditing = user !== null;

  /*
   * Form durumu useState baslatici ile kuruluyor; acilista sifirlayan bir
   * useEffect KULLANILMIYOR. Bunun nedeni efekt icinde senkron setState
   * cagirmanin gereksiz render zinciri uretmesi (ve lint kuralina
   * takilmasi). Dialog, AdminPage tarafindan yalnizca acikken mount
   * edildigi icin her acilista state zaten sifirdan baslar.
   */
  const [form, setForm] = useState<UserForm>(() =>
    user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: "",
          role: user.role,
          active: user.active,
        }
      : emptyForm,
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof UserForm>(
    field: K,
    value: UserForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (user) {
        const updated = await updateUser(user.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role,
          active: form.active,
        });

        onSaved(updated, false);
      } else {
        const created = await createUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          active: form.active,
        });

        onSaved(created, true);
      }
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

      setErrorMessage(
        apiMessage || "Kullanıcı kaydedilirken bir hata oluştu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" component="span">
          {isEditing ? "Kullanıcıyı düzenle" : "Yeni kullanıcı"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Stack
            useFlexGap
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <TextField
              label="Ad"
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              disabled={isSubmitting}
              required
              fullWidth
            />

            <TextField
              label="Soyad"
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              disabled={isSubmitting}
              required
              fullWidth
            />
          </Stack>

          <TextField
            label="E-posta"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            // E-posta kullanicinin kimligidir; duzenlemede degistirilmez.
            disabled={isSubmitting || isEditing}
            helperText={
              isEditing ? "E-posta adresi değiştirilemez." : undefined
            }
            required
            fullWidth
          />

          {!isEditing && (
            <TextField
              label="Parola"
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              disabled={isSubmitting}
              helperText="En az 8 karakter."
              required
              fullWidth
            />
          )}

          <TextField
            select
            label="Rol"
            value={form.role}
            onChange={(event) =>
              updateField("role", event.target.value as RoleCode)
            }
            disabled={isSubmitting}
            fullWidth
          >
            {Object.entries(roleLabels).map(([code, label]) => (
              <MenuItem key={code} value={code}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={form.active}
                onChange={(event) => updateField("active", event.target.checked)}
                disabled={isSubmitting}
              />
            }
            label="Aktif (pasif kullanıcı giriş yapamaz)"
          />

          <Stack
            direction="row"
            useFlexGap
            sx={{ gap: 1, justifyContent: "flex-end" }}
          >
            <Button type="button" onClick={onClose} disabled={isSubmitting}>
              Vazgeç
            </Button>

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default UserFormDialog;
