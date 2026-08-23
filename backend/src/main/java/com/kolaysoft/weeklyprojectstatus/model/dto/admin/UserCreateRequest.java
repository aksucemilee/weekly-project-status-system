package com.kolaysoft.weeklyprojectstatus.model.dto.admin;

import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserCreateRequest {

    @NotBlank(message = "Ad zorunludur.")
    @Size(max = 100, message = "Ad en fazla 100 karakter olabilir.")
    private String firstName;

    @NotBlank(message = "Soyad zorunludur.")
    @Size(max = 100, message = "Soyad en fazla 100 karakter olabilir.")
    private String lastName;

    @NotBlank(message = "E-posta zorunludur.")
    @Email(message = "Geçerli bir e-posta adresi giriniz.")
    @Size(max = 180, message = "E-posta en fazla 180 karakter olabilir.")
    private String email;

    @NotBlank(message = "Parola zorunludur.")
    @Size(min = 8, message = "Parola en az 8 karakter olmalıdır.")
    private String password;

    @NotNull(message = "Rol zorunludur.")
    private RoleCode role;

    private Boolean active;

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public RoleCode getRole() {
        return role;
    }

    public void setRole(RoleCode role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
