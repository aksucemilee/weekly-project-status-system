package com.kolaysoft.weeklyprojectstatus.controller;

import com.kolaysoft.weeklyprojectstatus.model.dto.admin.AssignmentCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.AssignmentResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.AssignmentUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.UserCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.UserResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.UserUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.service.AdminUserService;
import com.kolaysoft.weeklyprojectstatus.service.ProjectAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminUserService adminUserService;
    private final ProjectAssignmentService projectAssignmentService;

    public AdminController(
            AdminUserService adminUserService,
            ProjectAssignmentService projectAssignmentService) {
        this.adminUserService = adminUserService;
        this.projectAssignmentService = projectAssignmentService;
    }

    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(adminUserService.createUser(request));
    }

    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(
                adminUserService.updateUser(userId, request));
    }

    @PreAuthorize("hasAuthority('ASSIGNMENT_MANAGE')")
    @PostMapping("/assignments")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(projectAssignmentService.createAssignment(request));
    }

    @PreAuthorize("hasAuthority('ASSIGNMENT_MANAGE')")
    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByUser(
            @RequestParam Long userId) {
        return ResponseEntity.ok(
                projectAssignmentService.getAssignmentsByUser(userId));
    }

    @PreAuthorize("hasAuthority('ASSIGNMENT_MANAGE')")
    @PutMapping("/assignments/{assignmentId}")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable Long assignmentId,
            @Valid @RequestBody AssignmentUpdateRequest request) {
        return ResponseEntity.ok(
                projectAssignmentService.updateAssignment(
                        assignmentId,
                        request));
    }
}
