package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportResponse;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueType;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
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
 * Risk seviyesinin acik risk kayitlarindan turetilmesi (bulgu T4).
 * Seviye kullanici girdisi degildir; her risk mutasyonundan sonra
 * yeniden hesaplanmalidir.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RiskLevelDerivationTest {

    @Autowired
    private WeeklyReportService weeklyReportService;

    @Autowired
    private RiskIssueService riskIssueService;

    @Autowired
    private TestDataFactory data;

    private Long reportId;
    private Long projectId;

    @BeforeEach
    void setUp() {
        Project project = data.project("Risk Testi");
        User pm = data.user(
                "pm@test.local",
                RoleCode.PROJE_YONETICISI,
                PermissionCode.REPORT_CREATE,
                PermissionCode.REPORT_VIEW,
                PermissionCode.RISK_MANAGE,
                PermissionCode.RISK_VIEW);
        data.assign(project, pm);
        TestAuth.loginAs(pm);

        projectId = project.getId();

        WeeklyReportCreateRequest request = new WeeklyReportCreateRequest();
        request.setReportWeekStart(LocalDate.of(2026, 7, 13));
        request.setTargetProgress(50);
        request.setActualProgress(45);
        request.setGeneralStatus(GeneralStatus.IN_PROGRESS);
        request.setScheduleStatus(ScheduleStatus.ON_TRACK);
        request.setCompletedSummary("Yapılanlar");
        request.setNextWeekPlan("Yapılacaklar");

        reportId = weeklyReportService.createWeeklyReport(projectId, request).getId();
    }

    @AfterEach
    void tearDown() {
        TestAuth.logout();
    }

    private RiskLevel currentLevel() {
        WeeklyReportResponse report =
                weeklyReportService.getReportById(projectId, reportId);

        return report.getRiskLevel();
    }

    private RiskIssueResponse addRisk(RiskLevel level, RiskIssueStatus status) {
        RiskIssueCreateRequest request = new RiskIssueCreateRequest();
        request.setType(RiskIssueType.RISK);
        request.setTitle("Test riski");
        request.setDescription("Açıklama");
        request.setRiskLevel(level);
        request.setStatus(status);

        return riskIssueService.createRiskIssue(reportId, request);
    }

    @Test
    @DisplayName("Risk kaydi yoksa seviye LOW'dur")
    void defaultsToLowWithoutRisks() {
        assertThat(currentLevel()).isEqualTo(RiskLevel.LOW);
    }

    @Test
    @DisplayName("Acik risk eklendiginde seviye yukselir")
    void openRiskRaisesLevel() {
        addRisk(RiskLevel.HIGH, RiskIssueStatus.OPEN);

        assertThat(currentLevel()).isEqualTo(RiskLevel.HIGH);
    }

    @Test
    @DisplayName("Birden fazla acik riskte en yuksek seviye gecerlidir")
    void highestOpenRiskWins() {
        addRisk(RiskLevel.LOW, RiskIssueStatus.OPEN);
        addRisk(RiskLevel.MEDIUM, RiskIssueStatus.ACTION_IN_PROGRESS);

        assertThat(currentLevel()).isEqualTo(RiskLevel.MEDIUM);
    }

    @Test
    @DisplayName("Cozulmus risk seviyeyi etkilemez")
    void resolvedRiskIsIgnored() {
        addRisk(RiskLevel.HIGH, RiskIssueStatus.RESOLVED);

        assertThat(currentLevel()).isEqualTo(RiskLevel.LOW);
    }

    @Test
    @DisplayName("Risk cozulunce seviye dusar")
    void resolvingRiskLowersLevel() {
        RiskIssueResponse created = addRisk(RiskLevel.HIGH, RiskIssueStatus.OPEN);
        assertThat(currentLevel()).isEqualTo(RiskLevel.HIGH);

        RiskIssueUpdateRequest update = new RiskIssueUpdateRequest();
        update.setType(RiskIssueType.RISK);
        update.setTitle("Test riski");
        update.setDescription("Açıklama");
        update.setRiskLevel(RiskLevel.HIGH);
        update.setStatus(RiskIssueStatus.RESOLVED);

        riskIssueService.updateRiskIssue(reportId, created.getId(), update);

        assertThat(currentLevel()).isEqualTo(RiskLevel.LOW);
    }

    @Test
    @DisplayName("Risk silinince seviye yeniden hesaplanir")
    void deletingRiskRecomputesLevel() {
        RiskIssueResponse high = addRisk(RiskLevel.HIGH, RiskIssueStatus.OPEN);
        addRisk(RiskLevel.MEDIUM, RiskIssueStatus.OPEN);
        assertThat(currentLevel()).isEqualTo(RiskLevel.HIGH);

        riskIssueService.deleteRiskIssue(reportId, high.getId());

        assertThat(currentLevel()).isEqualTo(RiskLevel.MEDIUM);
    }
}
