package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.dto.dashboard.DashboardProjectSummaryResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.dashboard.DashboardSummaryResponse;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.WorkItemStatus;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import com.kolaysoft.weeklyprojectstatus.repository.WeeklyReportRepository;
import com.kolaysoft.weeklyprojectstatus.repository.WorkItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

        private static final List<WorkItemStatus> ACTIVE_WORK_ITEM_STATUSES = List.of(
                        WorkItemStatus.IN_PROGRESS,
                        WorkItemStatus.IN_TEST,
                        WorkItemStatus.BLOCKED);

        private final ProjectRepository projectRepository;
        private final WeeklyReportRepository weeklyReportRepository;
        private final WorkItemRepository workItemRepository;

        public DashboardService(
                        ProjectRepository projectRepository,
                        WeeklyReportRepository weeklyReportRepository,
                        WorkItemRepository workItemRepository) {
                this.projectRepository = projectRepository;
                this.weeklyReportRepository = weeklyReportRepository;
                this.workItemRepository = workItemRepository;
        }

        public DashboardSummaryResponse getDashboardSummary(
                        LocalDate weekStart,
                        Long projectId,
                        GeneralStatus generalStatus,
                        RiskLevel riskLevel,
                        ScheduleStatus scheduleStatus) {
                LocalDate weekEnd = weekStart == null ? null : weekStart.plusDays(6);

                List<DashboardProjectSummaryResponse> projectSummaries = projectRepository
                                .findByActiveTrueOrderByNameAsc()
                                .stream()
                                .filter(project -> projectId == null
                                                || project.getId().equals(projectId))
                                .map(project -> createProjectSummary(
                                                project,
                                                weekStart,
                                                weekEnd))
                                .filter(summary -> generalStatus == null
                                                || summary.generalStatus() == generalStatus)
                                .filter(summary -> riskLevel == null
                                                || summary.riskLevel() == riskLevel)
                                .filter(summary -> scheduleStatus == null
                                                || summary.scheduleStatus() == scheduleStatus)
                                .toList();

                long projectsWithReports = projectSummaries.stream()
                                .filter(summary -> summary.latestReportId() != null)
                                .count();

                long highRiskProjects = projectSummaries.stream()
                                .filter(summary -> summary.riskLevel() == RiskLevel.HIGH)
                                .count();

                long delayedProjects = projectSummaries.stream()
                                .filter(summary -> summary.scheduleStatus() == ScheduleStatus.DELAYED)
                                .count();

                long blockedProjects = projectSummaries.stream()
                                .filter(summary -> summary.projectStatus() == ProjectStatus.BLOCKED)
                                .count();

                return new DashboardSummaryResponse(
                                projectSummaries.size(),
                                projectsWithReports,
                                highRiskProjects,
                                delayedProjects,
                                blockedProjects,
                                projectSummaries);
        }

        private DashboardProjectSummaryResponse createProjectSummary(
                        Project project,
                        LocalDate weekStart,
                        LocalDate weekEnd) {
                Optional<WeeklyReport> selectedReport;

                if (weekStart == null) {
                        selectedReport = weeklyReportRepository
                                        .findFirstByProjectIdOrderByReportWeekStartDesc(
                                                        project.getId());
                } else {
                        selectedReport = weeklyReportRepository
                                        .findFirstByProjectIdAndReportWeekStartBetweenOrderByReportWeekStartDesc(
                                                        project.getId(),
                                                        weekStart,
                                                        weekEnd);
                }

                if (selectedReport.isEmpty()) {
                        return createSummaryWithoutReport(project);
                }

                WeeklyReport report = selectedReport.get();

                long activeWorkItemCount = workItemRepository.countByWeeklyReport_IdAndStatusIn(
                                report.getId(),
                                ACTIVE_WORK_ITEM_STATUSES);

                return new DashboardProjectSummaryResponse(
                                project.getId(),
                                project.getName(),
                                project.getCustomerName(),
                                project.getStatus(),
                                report.getId(),
                                report.getReportWeekStart(),
                                report.getTargetProgress(),
                                report.getActualProgress(),
                                report.getGeneralStatus(),
                                report.getScheduleStatus(),
                                report.getRiskLevel(),
                                activeWorkItemCount);
        }

        private DashboardProjectSummaryResponse createSummaryWithoutReport(
                        Project project) {
                return new DashboardProjectSummaryResponse(
                                project.getId(),
                                project.getName(),
                                project.getCustomerName(),
                                project.getStatus(),
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                0);
        }
}