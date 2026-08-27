package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import com.kolaysoft.weeklyprojectstatus.exception.DuplicateResourceException;
import com.kolaysoft.weeklyprojectstatus.support.TestDataFactory;
import com.kolaysoft.weeklyprojectstatus.support.TestAuth;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Haftalik rapor is kurallari: hafta normalizasyonu, cakisma kurali,
 * kapsam (sahiplik) kontrolu ve pasif proje kurali.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WeeklyReportServiceTest {

    @Autowired
    private WeeklyReportService weeklyReportService;

    @Autowired
    private TestDataFactory data;

    private Project project;
    private User projectManager;

    @BeforeEach
    void setUp() {
        project = data.project("Test Projesi");
        projectManager = data.user(
                "pm@test.local",
                RoleCode.PROJE_YONETICISI,
                PermissionCode.REPORT_CREATE,
                PermissionCode.REPORT_UPDATE,
                PermissionCode.REPORT_VIEW);
        data.assign(project, projectManager);

        TestAuth.loginAs(projectManager);
    }

    @AfterEach
    void tearDown() {
        TestAuth.logout();
    }

    private WeeklyReportCreateRequest createRequest(LocalDate week) {
        WeeklyReportCreateRequest request = new WeeklyReportCreateRequest();
        request.setReportWeekStart(week);
        request.setTargetProgress(50);
        request.setActualProgress(45);
        request.setGeneralStatus(GeneralStatus.IN_PROGRESS);
        request.setScheduleStatus(ScheduleStatus.ON_TRACK);
        request.setCompletedSummary("Yapılanlar");
        request.setNextWeekPlan("Yapılacaklar");

        return request;
    }

    // --- Hafta normalizasyonu (bulgu H10) ---

    @Test
    @DisplayName("Hafta ici bir gun gonderilse de rapor Pazartesi'ye kaydedilir")
    void reportWeekIsNormalizedToMonday() {
        WeeklyReportResponse wednesday = weeklyReportService.createWeeklyReport(
                project.getId(),
                createRequest(LocalDate.of(2026, 7, 15)));

        assertThat(wednesday.getReportWeekStart())
                .isEqualTo(LocalDate.of(2026, 7, 13));
    }

    @Test
    @DisplayName("Pazar gonderildiginde de ayni haftanin Pazartesi'si kaydedilir")
    void sundayNormalizesToSameWeekMonday() {
        WeeklyReportResponse sunday = weeklyReportService.createWeeklyReport(
                project.getId(),
                createRequest(LocalDate.of(2026, 7, 19)));

        assertThat(sunday.getReportWeekStart())
                .isEqualTo(LocalDate.of(2026, 7, 13));
    }

    // --- Cakisma kurali (On Analiz acik soru 2) ---

    @Test
    @DisplayName("Ayni haftanin baska bir gunu icin ikinci rapor 409 verir")
    void secondReportInSameWeekIsRejected() {
        weeklyReportService.createWeeklyReport(
                project.getId(),
                createRequest(LocalDate.of(2026, 7, 13)));

        assertThatThrownBy(() -> weeklyReportService.createWeeklyReport(
                project.getId(),
                createRequest(LocalDate.of(2026, 7, 16))))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    @DisplayName("Farkli hafta icin ikinci rapor olusturulabilir")
    void reportInAnotherWeekIsAllowed() {
        weeklyReportService.createWeeklyReport(
                project.getId(),
                createRequest(LocalDate.of(2026, 7, 13)));

        WeeklyReportResponse next = weeklyReportService.createWeeklyReport(
                project.getId(),
                createRequest(LocalDate.of(2026, 7, 20)));

        assertThat(next.getReportWeekStart())
                .isEqualTo(LocalDate.of(2026, 7, 20));
    }

    @Test
    @DisplayName("Guncellemede raporun kendi haftasi cakisma sayilmaz")
    void updatingReportToItsOwnWeekIsAllowed() {
        WeeklyReportResponse created = weeklyReportService.createWeeklyReport(
                project.getId(),
                createRequest(LocalDate.of(2026, 7, 13)));

        WeeklyReportUpdateRequest update = new WeeklyReportUpdateRequest();
        update.setReportWeekStart(LocalDate.of(2026, 7, 15));
        update.setTargetProgress(60);
        update.setActualProgress(55);
        update.setGeneralStatus(GeneralStatus.IN_TEST);
        update.setScheduleStatus(ScheduleStatus.ON_TRACK);
        update.setCompletedSummary("Güncellendi");
        update.setNextWeekPlan("Plan");

        WeeklyReportResponse updated = weeklyReportService.updateWeeklyReport(
                project.getId(),
                created.getId(),
                update);

        assertThat(updated.getReportWeekStart())
                .isEqualTo(LocalDate.of(2026, 7, 13));
        assertThat(updated.getTargetProgress()).isEqualTo(60);
    }

    // --- Kapsam (sahiplik) kontrolu ---

    @Test
    @DisplayName("Atanmadigi projede rapor olusturulamaz")
    void reportCannotBeCreatedOnUnassignedProject() {
        Project other = data.project("Atanmamış Proje");

        assertThatThrownBy(() -> weeklyReportService.createWeeklyReport(
                other.getId(),
                createRequest(LocalDate.of(2026, 7, 13))))
                .isInstanceOf(AccessDeniedException.class);
    }

    // --- Pasif proje kurali (bulgu T6) ---

    @Test
    @DisplayName("Pasif projeye rapor eklenemez")
    void reportCannotBeAddedToInactiveProject() {
        Project inactive = data.project("Pasif Proje", false);
        data.assign(inactive, projectManager);

        assertThatThrownBy(() -> weeklyReportService.createWeeklyReport(
                inactive.getId(),
                createRequest(LocalDate.of(2026, 7, 13))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Pasif projeye");
    }

    // --- Siralama allow-list (T13) ---

    @Test
    @DisplayName("Izin verilmeyen siralama alani reddedilir")
    void invalidSortFieldIsRejected() {
        assertThatThrownBy(() -> weeklyReportService.getReportsByProject(
                project.getId(), null, null, null, null, 0, 10, "hacked,asc"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Geçersiz sıralama alanı");
    }

    @Test
    @DisplayName("Izin verilmeyen siralama yonu reddedilir")
    void invalidSortDirectionIsRejected() {
        assertThatThrownBy(() -> weeklyReportService.getReportsByProject(
                project.getId(), null, null, null, null, 0, 10, "reportWeekStart,sideways"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Geçersiz sıralama yönü");
    }

    // --- Filtrede hafta normalizasyonu ---

    @Test
    @DisplayName("Hafta ici bir gunle filtrelendiginde o haftanin raporu bulunur")
    void weekFilterIsNormalized() {
        weeklyReportService.createWeeklyReport(
                project.getId(),
                createRequest(LocalDate.of(2026, 7, 13)));

        var result = weeklyReportService.getReportsByProject(
                project.getId(),
                LocalDate.of(2026, 7, 16),
                null, null, null, 0, 10, null);

        assertThat(result.totalElements()).isEqualTo(1);
    }
}
