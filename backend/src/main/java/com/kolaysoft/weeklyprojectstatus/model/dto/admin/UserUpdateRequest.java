package com.kolaysoft.weeklyprojectstatus.model.dto.admin;

import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {

    @NotBlank(message = "Ad zorunludur.")
    @Size(max = 100, message = "Ad en fazla 100 karakter olabilir.")
    private String firstName;

    @NotBlank(message = "Soyad zorunludur.")
    @Size(max = 100, message = "Soyad en fazla 100 karakter olabilir.")
    private String lastName;

    @NotNull(message = "Rol zorunludur.")
    private RoleCode role;

    @NotNull(message = "Aktiflik bilgisi zorunludur.")
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
