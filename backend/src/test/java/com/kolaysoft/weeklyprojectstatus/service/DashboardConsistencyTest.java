package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.dto.dashboard.DashboardProjectSummaryResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.dashboard.DashboardSummaryResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import com.kolaysoft.weeklyprojectstatus.support.TestAuth;
import com.kolaysoft.weeklyprojectstatus.support.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Dashboard sayaclarinin tablo satirlariyla ayni kaynaktan beslenmesi
 * (bulgu T3) ve yasam dongusu alaninin gostergelere karismamasi (T1).
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DashboardConsistencyTest {

    private static final LocalDate WEEK = LocalDate.of(2026, 7, 13);

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private WeeklyReportService weeklyReportService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TestDataFactory data;

    private User pm;

    @BeforeEach
    void setUp() {
        pm = data.user(
                "pm@test.local",
                RoleCode.PROJE_YONETICISI,
                PermissionCode.REPORT_CREATE,
                PermissionCode.REPORT_VIEW,
                PermissionCode.DASHBOARD_VIEW);
        TestAuth.loginAs(pm);
    }

    @AfterEach
    void tearDown() {
        TestAuth.logout();
    }

    private void reportFor(
            Project project,
            GeneralStatus generalStatus,
            ScheduleStatus scheduleStatus) {
        data.assign(project, pm);

        WeeklyReportCreateRequest request = new WeeklyReportCreateRequest();
        request.setReportWeekStart(WEEK);
        request.setTargetProgress(50);
        request.setActualProgress(40);
        request.setGeneralStatus(generalStatus);
        request.setScheduleStatus(scheduleStatus);
        request.setCompletedSummary("Yapılanlar");
        request.setNextWeekPlan("Yapılacaklar");

        weeklyReportService.createWeeklyReport(project.getId(), request);
    }

    private DashboardSummaryResponse dashboard() {
        return dashboardService.getDashboardSummary(WEEK, null, null, null, null);
    }

    @Test
    @DisplayName("Bloke sayaci tablodaki BLOCKED satir sayisiyla ayni")
    void blockedCounterMatchesRows() {
        reportFor(data.project("Bloke Proje"), GeneralStatus.BLOCKED, ScheduleStatus.DELAYED);
        reportFor(data.project("Normal Proje"), GeneralStatus.IN_PROGRESS, ScheduleStatus.ON_TRACK);

        DashboardSummaryResponse summary = dashboard();

        long blockedRows = summary.projects().stream()
                .filter(p -> p.generalStatus() == GeneralStatus.BLOCKED)
                .count();

        assertThat(summary.blockedProjects()).isEqualTo(blockedRows).isEqualTo(1);
    }

    @Test
    @DisplayName("Geciken sayaci tablodaki DELAYED satir sayisiyla ayni")
    void delayedCounterMatchesRows() {
        reportFor(data.project("Geciken Proje"), GeneralStatus.IN_PROGRESS, ScheduleStatus.DELAYED);
        reportFor(data.project("Zamaninda Proje"), GeneralStatus.IN_PROGRESS, ScheduleStatus.ON_TRACK);

        DashboardSummaryResponse summary = dashboard();

        long delayedRows = summary.projects().stream()
                .filter(p -> p.scheduleStatus() == ScheduleStatus.DELAYED)
                .count();

        assertThat(summary.delayedProjects()).isEqualTo(delayedRows).isEqualTo(1);
    }

    @Test
    @DisplayName("Yasam dongusu ON_HOLD olan proje bloke sayilmaz")
    void lifecycleDoesNotDriveBlockedCounter() {
        Project onHold = data.project("Askıda Proje");
        onHold.setStatus(ProjectStatus.ON_HOLD);
        projectRepository.save(onHold);

        reportFor(onHold, GeneralStatus.IN_PROGRESS, ScheduleStatus.ON_TRACK);

        DashboardSummaryResponse summary = dashboard();

        assertThat(summary.blockedProjects()).isZero();
    }

    @Test
    @DisplayName("Pasif proje dashboard'da listelenmez")
    void inactiveProjectIsExcluded() {
        reportFor(data.project("Aktif Proje"), GeneralStatus.IN_PROGRESS, ScheduleStatus.ON_TRACK);

        Project inactive = data.project("Pasif Proje", false);
        data.assign(inactive, pm);

        DashboardSummaryResponse summary = dashboard();

        assertThat(summary.projects())
                .extracting(DashboardProjectSummaryResponse::projectName)
                .doesNotContain("Pasif Proje");
    }

    @Test
    @DisplayName("Raporu olmayan proje listelenir ama rapor bekliyor gorunur")
    void projectWithoutReportIsListed() {
        data.project("Raporsuz Proje");

        DashboardSummaryResponse summary = dashboard();

        DashboardProjectSummaryResponse row = summary.projects().stream()
                .filter(p -> p.projectName().equals("Raporsuz Proje"))
                .findFirst()
                .orElseThrow();

        assertThat(row.latestReportId()).isNull();
        assertThat(row.riskLevel()).isNull();
        assertThat(summary.projectsWithReports()).isZero();
    }

    @Test
    @DisplayName("Risk seviyesi turetilmis degerle dashboard'a yansir")
    void derivedRiskLevelAppearsOnDashboard() {
        reportFor(data.project("Riskli Proje"), GeneralStatus.IN_PROGRESS, ScheduleStatus.ON_TRACK);

        DashboardSummaryResponse summary = dashboard();

        assertThat(summary.projects())
                .singleElement()
                .satisfies(row -> assertThat(row.riskLevel()).isEqualTo(RiskLevel.LOW));
        assertThat(summary.highRiskProjects()).isZero();
    }
}
