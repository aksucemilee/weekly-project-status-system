package com.kolaysoft.weeklyprojectstatus.model.dto.admin;

import com.kolaysoft.weeklyprojectstatus.model.enums.AssignmentRole;
import jakarta.validation.constraints.NotNull;

public class AssignmentCreateRequest {

    @NotNull(message = "Proje zorunludur.")
    private Long projectId;

    @NotNull(message = "Kullanıcı zorunludur.")
    private Long userId;

    @NotNull(message = "Atama rolü zorunludur.")
    private AssignmentRole assignmentRole;

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public AssignmentRole getAssignmentRole() {
        return assignmentRole;
    }

    public void setAssignmentRole(AssignmentRole assignmentRole) {
        this.assignmentRole = assignmentRole;
    }
}
