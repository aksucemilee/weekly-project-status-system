package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.DuplicateResourceException;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportResponse;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.repository.WeeklyReportRepository;
import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WeeklyReportService {

        private final WeeklyReportRepository weeklyReportRepository;
        private final ProjectService projectService;

        public WeeklyReportService(
                        WeeklyReportRepository weeklyReportRepository,
                        ProjectService projectService) {
                this.weeklyReportRepository = weeklyReportRepository;
                this.projectService = projectService;
        }

        public WeeklyReportResponse createWeeklyReport(
                        Long projectId,
                        WeeklyReportCreateRequest request) {
                Project project = projectService.getProjectEntity(projectId);

                boolean reportAlreadyExists = weeklyReportRepository.existsByProjectIdAndReportWeekStart(
                                projectId,
                                request.getReportWeekStart());

                if (reportAlreadyExists) {
                        throw new DuplicateResourceException(
                                        "Weekly report already exists for project id "
                                                        + projectId
                                                        + " and week "
                                                        + request.getReportWeekStart());
                }

                WeeklyReport weeklyReport = new WeeklyReport();

                weeklyReport.setProject(project);
                weeklyReport.setReportWeekStart(request.getReportWeekStart());
                weeklyReport.setTargetProgress(request.getTargetProgress());
                weeklyReport.setActualProgress(request.getActualProgress());
                weeklyReport.setGeneralStatus(request.getGeneralStatus());
                weeklyReport.setScheduleStatus(request.getScheduleStatus());
                weeklyReport.setRiskLevel(request.getRiskLevel());
                weeklyReport.setCompletedSummary(request.getCompletedSummary());
                weeklyReport.setNextWeekPlan(request.getNextWeekPlan());
                weeklyReport.setBlockers(request.getBlockers());
                weeklyReport.setGeneralNote(request.getGeneralNote());

                WeeklyReport savedReport = weeklyReportRepository.save(weeklyReport);

                return toResponse(savedReport);
        }

        @Transactional(readOnly = true)
        public List<WeeklyReportResponse> getReportsByProject(Long projectId) {
                projectService.getProjectEntity(projectId);

                return weeklyReportRepository
                                .findByProjectIdOrderByReportWeekStartDesc(projectId)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public WeeklyReport getWeeklyReportEntity(Long weeklyReportId) {
                return weeklyReportRepository
                                .findById(weeklyReportId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Weekly report not found with id: " + weeklyReportId));
        }

        private WeeklyReportResponse toResponse(WeeklyReport weeklyReport) {
                return new WeeklyReportResponse(
                                weeklyReport.getId(),
                                weeklyReport.getProject().getId(),
                                weeklyReport.getProject().getName(),
                                weeklyReport.getReportWeekStart(),
                                weeklyReport.getTargetProgress(),
                                weeklyReport.getActualProgress(),
                                weeklyReport.getGeneralStatus(),
                                weeklyReport.getScheduleStatus(),
                                weeklyReport.getRiskLevel(),
                                weeklyReport.getCompletedSummary(),
                                weeklyReport.getNextWeekPlan(),
                                weeklyReport.getBlockers(),
                                weeklyReport.getGeneralNote(),
                                weeklyReport.getCreatedAt(),
                                weeklyReport.getUpdatedAt());
        }
}