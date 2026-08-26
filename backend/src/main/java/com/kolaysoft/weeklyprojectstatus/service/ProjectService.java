package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.project.ProjectCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.project.ProjectResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.project.ProjectUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import com.kolaysoft.weeklyprojectstatus.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;
    private final ProjectAssignmentService projectAssignmentService;

    public ProjectService(
            ProjectRepository projectRepository,
            CurrentUserService currentUserService,
            ProjectAssignmentService projectAssignmentService) {
        this.projectRepository = projectRepository;
        this.currentUserService = currentUserService;
        this.projectAssignmentService = projectAssignmentService;
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
     * Proje temel bilgilerini gunceller (On Analiz 12.2).
     *
     * Durum ve aktiflik yalnizca olusturmada belirlenebildigi surece bir
     * proje tamamlandi/bloke olarak isaretlenemiyor ve portfoyden
     * cikarilamiyordu; dashboard "bloke proje" sayaci ile aktif proje
     * listesi bu iki alana dayandigi icin guncelleme bu akisi tamamlar.
     */
    public ProjectResponse updateProject(
            Long projectId,
            ProjectUpdateRequest request) {
        Project project = getProjectEntity(projectId);

        project.setName(request.getName());
        project.setCustomerName(request.getCustomerName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setTargetEndDate(request.getTargetEndDate());
        project.setStatus(request.getStatus());
        project.setActive(request.getActive());

        return toResponse(projectRepository.save(project));
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

        Map<Long, String> responsibleManagers = projectAssignmentService
                .findResponsibleManagerNames(
                        projects.stream().map(Project::getId).toList());

        return projects
                .stream()
                .map(project -> toResponse(
                        project,
                        responsibleManagers.get(project.getId())))
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

    /**
     * Sorumlu proje yoneticisi ayri bir sorgu gerektirdigi icin, liste
     * uretirken toplu okunup buraya gecirilir; tekil yanitlarda proje
     * basina tek bir arama yapilir.
     */
    private ProjectResponse toResponse(Project project) {
        return toResponse(
                project,
                projectAssignmentService
                        .findResponsibleManagerNames(List.of(project.getId()))
                        .get(project.getId()));
    }

    private ProjectResponse toResponse(
            Project project,
            String responsibleManager) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getCustomerName(),
                responsibleManager,
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