package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.DuplicateResourceException;
import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.AssignmentCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.AssignmentResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.AssignmentUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.ProjectAssignment;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectAssignmentRepository;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import com.kolaysoft.weeklyprojectstatus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectAssignmentService {

    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectAssignmentService(
            ProjectAssignmentRepository projectAssignmentRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository) {
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    /**
     * Ayni kullanici-proje ikilisi icin ikinci bir AKTIF atama olusturulmasi
     * engellenir (On Analiz 7.8, is kurali 4).
     */
    public AssignmentResponse createAssignment(
            AssignmentCreateRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Proje bulunamadı: " + request.getProjectId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Kullanıcı bulunamadı: " + request.getUserId()));

        boolean alreadyAssigned = projectAssignmentRepository
                .existsByProject_IdAndUser_IdAndActiveTrue(
                        project.getId(),
                        user.getId());

        if (alreadyAssigned) {
            throw new DuplicateResourceException(
                    "Bu kullanıcı bu projeye zaten atanmış durumda.");
        }

        ProjectAssignment assignment = new ProjectAssignment();

        assignment.setProject(project);
        assignment.setUser(user);
        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setActive(true);

        return toResponse(projectAssignmentRepository.save(assignment));
    }

    public AssignmentResponse updateAssignment(
            Long assignmentId,
            AssignmentUpdateRequest request) {
        ProjectAssignment assignment = projectAssignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Atama bulunamadı: " + assignmentId));

        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setActive(request.getActive());

        return toResponse(projectAssignmentRepository.save(assignment));
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByUser(Long userId) {
        return projectAssignmentRepository
                .findByUser_IdAndActiveTrue(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AssignmentResponse toResponse(ProjectAssignment assignment) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getProject().getId(),
                assignment.getProject().getName(),
                assignment.getUser().getId(),
                assignment.getUser().getEmail(),
                assignment.getAssignmentRole(),
                assignment.isActive());
    }
}
