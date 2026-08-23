package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.project.ProjectCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.project.ProjectResponse;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import com.kolaysoft.weeklyprojectstatus.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;

    public ProjectService(
            ProjectRepository projectRepository,
            CurrentUserService currentUserService) {
        this.projectRepository = projectRepository;
        this.currentUserService = currentUserService;
    }

    public ProjectResponse createProject(ProjectCreateRequest request) {
        Project project = new Project();

        project.setName(request.getName());
        project.setCustomerName(request.getCustomerName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setTargetEndDate(request.getTargetEndDate());

        ProjectStatus status = request.getStatus() != null
                ? request.getStatus()
                : ProjectStatus.PLANNED;

        project.setStatus(status);

        Project savedProject = projectRepository.save(project);

        return toResponse(savedProject);
    }

    /**
     * Kapsam kisitli roller (proje yoneticisi, ekip lideri) yalnizca
     * atandiklari projeleri gorur; kapsam kisiti olmayan roller (CTO,
     * admin) tum projeleri gorur.
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        Optional<List<Long>> allowedProjectIds =
                currentUserService.getAllowedProjectIds();

        List<Project> projects = allowedProjectIds
                .map(ids -> ids.isEmpty()
                        ? List.<Project>of()
                        : projectRepository.findAllById(ids))
                .orElseGet(projectRepository::findAll);

        return projects
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long projectId) {
        currentUserService.checkProjectAccess(projectId);

        return toResponse(getProjectEntity(projectId));
    }

    @Transactional(readOnly = true)
    public Project getProjectEntity(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Project not found with id: " + projectId
                ));
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getCustomerName(),
                project.getDescription(),
                project.getStartDate(),
                project.getTargetEndDate(),
                project.getStatus(),
                project.isActive(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}