package com.kolaysoft.weeklyprojectstatus.model.dto.admin;

import com.kolaysoft.weeklyprojectstatus.model.enums.AssignmentRole;

public record AssignmentResponse(
        Long id,
        Long projectId,
        String projectName,
        Long userId,
        String userEmail,
        AssignmentRole assignmentRole,
        boolean active) {
}
