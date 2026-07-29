package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.project.ProjectCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.project.ProjectResponse;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
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

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long projectId) {
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