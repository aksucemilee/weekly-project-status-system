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
import com.kolaysoft.weeklyprojectstatus.repository.WeeklyReportSpecifications;
import com.kolaysoft.weeklyprojectstatus.repository.WorkItemRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

                List<Project> activeProjects = projectRepository
                                .findByActiveTrueOrderByNameAsc()
                                .stream()
                                .filter(project -> projectId == null
                                                || project.getId().equals(projectId))
                                .toList();

                Map<Long, WeeklyReport> latestMatchingReportByProjectId = findLatestReportsForProjects(
                                activeProjects,
                                weekStart,
                                weekEnd);

                List<DashboardProjectSummaryResponse> projectSummaries = activeProjects
                                .stream()
                                .map(project -> createProjectSummary(
                                                project,
                                                latestMatchingReportByProjectId.get(project.getId())))
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

        /**
         * projectId ve weekStart (varsa) icin Specification tabanli TEK bir
         * sorgu ile, verilen projelere ait tum aday raporlari (aktif proje
         * kumesiyle sinirli, varsa hafta penceresiyle sinirli) ceker; sonucu
         * reportWeekStart DESC sirali doner. Bu sirada her proje icin ILK
         * gorulen kayit (Map.putIfAbsent), o projenin bu aday kume icindeki
         * EN GUNCEL raporudur - yani sonuc, projeler icin ayri ayri yapilan
         * "findFirst...OrderByReportWeekStartDesc" cagrilariyla birebir
         * ayni raporu secer, ama tek bir veritabani sorgusuyla.
         *
         * generalStatus/riskLevel/scheduleStatus buraya dahil edilmez: bu
         * alanlar projenin SECILEN raporuna uygulanir, ham WeeklyReport
         * satirlarina degil. Bu filtreleri sorgu seviyesine tasimak, bir
         * projenin en guncel raporu filtreye uymasa bile gecmiste uyan bir
         * raporu varsa projeyi yanlislikla dahil edebilir - bu da mevcut
         * davranisi degistirir. Bu nedenle bu ucu, secim yapildiktan sonra
         * (createProjectSummary sonrasi) Java'da uygulanmaya devam eder.
         */
        private Map<Long, WeeklyReport> findLatestReportsForProjects(
                        List<Project> projects,
                        LocalDate weekStart,
                        LocalDate weekEnd) {
                if (projects.isEmpty()) {
                        return Map.of();
                }

                List<Long> projectIds = projects.stream()
                                .map(Project::getId)
                                .toList();

                Specification<WeeklyReport> specification = Specification
                                .<WeeklyReport>where(WeeklyReportSpecifications.projectIdIn(projectIds))
                                .and(WeeklyReportSpecifications.weekStartBetween(weekStart, weekEnd));

                List<WeeklyReport> candidateReports = weeklyReportRepository.findAll(
                                specification,
                                Sort.by(Sort.Direction.DESC, "reportWeekStart"));

                Map<Long, WeeklyReport> latestByProjectId = new LinkedHashMap<>();

                for (WeeklyReport report : candidateReports) {
                        latestByProjectId.putIfAbsent(report.getProject().getId(), report);
                }

                return latestByProjectId;
        }

        private DashboardProjectSummaryResponse createProjectSummary(
                        Project project,
                        WeeklyReport report) {
                if (report == null) {
                        return createSummaryWithoutReport(project);
                }

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