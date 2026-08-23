package com.kolaysoft.weeklyprojectstatus.model.dto.admin;

import com.kolaysoft.weeklyprojectstatus.model.enums.AssignmentRole;
import jakarta.validation.constraints.NotNull;

public class AssignmentUpdateRequest {

    @NotNull(message = "Atama rolü zorunludur.")
    private AssignmentRole assignmentRole;

    @NotNull(message = "Aktiflik bilgisi zorunludur.")
    private Boolean active;

    public AssignmentRole getAssignmentRole() {
        return assignmentRole;
    }

    public void setAssignmentRole(AssignmentRole assignmentRole) {
        this.assignmentRole = assignmentRole;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
