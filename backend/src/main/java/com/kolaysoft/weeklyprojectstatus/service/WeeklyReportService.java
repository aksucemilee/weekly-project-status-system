package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.DuplicateResourceException;
import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportResponse;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import com.kolaysoft.weeklyprojectstatus.repository.WeeklyReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

                boolean reportAlreadyExists = weeklyReportRepository
                                .existsByProjectIdAndReportWeekStart(
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
        public List<WeeklyReportResponse> getReportsByProject(
                        Long projectId,
                        LocalDate weekStart,
                        GeneralStatus generalStatus,
                        RiskLevel riskLevel,
                        ScheduleStatus scheduleStatus) {
                projectService.getProjectEntity(projectId);

                return weeklyReportRepository
                                .findByProjectIdOrderByReportWeekStartDesc(projectId)
                                .stream()
                                .filter(report -> weekStart == null
                                                || report.getReportWeekStart().equals(weekStart))
                                .filter(report -> generalStatus == null
                                                || report.getGeneralStatus() == generalStatus)
                                .filter(report -> riskLevel == null
                                                || report.getRiskLevel() == riskLevel)
                                .filter(report -> scheduleStatus == null
                                                || report.getScheduleStatus() == scheduleStatus)
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public WeeklyReportResponse getReportById(
                        Long projectId,
                        Long weeklyReportId) {
                WeeklyReport weeklyReport = weeklyReportRepository
                                .findByIdAndProject_Id(
                                                weeklyReportId,
                                                projectId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Weekly report not found with id: "
                                                                + weeklyReportId
                                                                + " for project id: "
                                                                + projectId));

                return toResponse(weeklyReport);
        }

        @Transactional(readOnly = true)
        public WeeklyReport getWeeklyReportEntity(
                        Long weeklyReportId) {
                return weeklyReportRepository
                                .findById(weeklyReportId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Weekly report not found with id: "
                                                                + weeklyReportId));
        }

        private WeeklyReportResponse toResponse(
                        WeeklyReport weeklyReport) {
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