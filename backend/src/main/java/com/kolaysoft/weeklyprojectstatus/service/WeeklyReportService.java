package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.DuplicateResourceException;
import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.common.PagedResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import com.kolaysoft.weeklyprojectstatus.repository.WeeklyReportRepository;
import com.kolaysoft.weeklyprojectstatus.repository.WeeklyReportSpecifications;
import com.kolaysoft.weeklyprojectstatus.security.CurrentUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

@Service
@Transactional
public class WeeklyReportService {

        private final WeeklyReportRepository weeklyReportRepository;
        private final ProjectService projectService;
        private final CurrentUserService currentUserService;

        public WeeklyReportService(
                        WeeklyReportRepository weeklyReportRepository,
                        ProjectService projectService,
                        CurrentUserService currentUserService) {
                this.weeklyReportRepository = weeklyReportRepository;
                this.projectService = projectService;
                this.currentUserService = currentUserService;
        }

        /**
         * Rapor donemi, secilen tarihin ait oldugu ISO haftasinin
         * Pazartesi'sine normalize edilir.
         *
         * On Analiz 14, acik soru 8 ("rapor donemi hafta numarasiyla mi,
         * tarihle mi tutulacak") cevapsizdi ve alan tek bir LocalDate
         * olarak, girilen gun aynen saklanacak sekilde uygulanmisti.
         * Bunun sonucunda ayni takvim haftasinin iki farkli gunu (orn.
         * Pazartesi ve Sali) ayri donem sayiliyor, boylece acik soru 2'nin
         * ("ayni proje ve hafta icin tek rapor") gerektirdigi kural fiilen
         * uygulanamiyordu: benzersizlik kisiti tam tarih uzerindeydi.
         *
         * Karar: donem "hafta"dir; kullanicidan Pazartesi secmesi
         * ISTENMEZ, girdi kanonik forma cevrilir. Sistemin geri kalani
         * zaten hafta varsayiyordu (dashboard weekStart..+6 gun penceresi,
         * alan adi reportWeekStart, seeder ciktisi).
         */
        private static LocalDate toWeekStart(LocalDate date) {
                return date == null
                                ? null
                                : date.with(DayOfWeek.MONDAY);
        }

        public WeeklyReportResponse createWeeklyReport(
                        Long projectId,
                        WeeklyReportCreateRequest request) {
                currentUserService.checkProjectAccess(projectId);

                Project project = projectService.getProjectEntity(projectId);

                LocalDate weekStart = toWeekStart(request.getReportWeekStart());

                boolean reportAlreadyExists = weeklyReportRepository
                                .existsByProjectIdAndReportWeekStart(
                                                projectId,
                                                weekStart);

                if (reportAlreadyExists) {
                        throw new DuplicateResourceException(
                                        "Weekly report already exists for project id "
                                                        + projectId
                                                        + " and week "
                                                        + weekStart);
                }

                WeeklyReport weeklyReport = new WeeklyReport();

                weeklyReport.setProject(project);
                weeklyReport.setReportWeekStart(weekStart);
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

        /**
         * On Analiz 5 (MVP) ve 7.4: proje yoneticisi yetkili oldugu projede
         * raporu daha sonra guncelleyebilir. On Analiz 14, acik soru 3'te
         * belirsiz birakilan nokta duzenlemenin SURE SINIRIDIR (bkz. 7.4,
         * is kurali 2); MVP karari sure siniri koymamaktir, erisim yalnizca
         * yetki (REPORT_UPDATE) ve kapsam (atama) ile sinirlanir.
         */
        public WeeklyReportResponse updateWeeklyReport(
                        Long projectId,
                        Long weeklyReportId,
                        WeeklyReportUpdateRequest request) {
                currentUserService.checkProjectAccess(projectId);

                WeeklyReport weeklyReport = weeklyReportRepository
                                .findByIdAndProject_Id(
                                                weeklyReportId,
                                                projectId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Weekly report not found with id: "
                                                                + weeklyReportId
                                                                + " for project id: "
                                                                + projectId));

                LocalDate weekStart = toWeekStart(request.getReportWeekStart());

                boolean weekTakenByAnotherReport = weeklyReportRepository
                                .existsByProjectIdAndReportWeekStartAndIdNot(
                                                projectId,
                                                weekStart,
                                                weeklyReportId);

                if (weekTakenByAnotherReport) {
                        throw new DuplicateResourceException(
                                        "Weekly report already exists for project id "
                                                        + projectId
                                                        + " and week "
                                                        + weekStart);
                }

                weeklyReport.setReportWeekStart(weekStart);
                weeklyReport.setTargetProgress(request.getTargetProgress());
                weeklyReport.setActualProgress(request.getActualProgress());
                weeklyReport.setGeneralStatus(request.getGeneralStatus());
                weeklyReport.setScheduleStatus(request.getScheduleStatus());
                weeklyReport.setRiskLevel(request.getRiskLevel());
                weeklyReport.setCompletedSummary(request.getCompletedSummary());
                weeklyReport.setNextWeekPlan(request.getNextWeekPlan());
                weeklyReport.setBlockers(request.getBlockers());
                weeklyReport.setGeneralNote(request.getGeneralNote());

                return toResponse(weeklyReportRepository.save(weeklyReport));
        }

        private static final Set<String> SORTABLE_FIELDS = Set.of(
                        "reportWeekStart",
                        "targetProgress",
                        "actualProgress");

        private static final String DEFAULT_SORT_FIELD = "reportWeekStart";

        @Transactional(readOnly = true)
        public PagedResponse<WeeklyReportResponse> getReportsByProject(
                        Long projectId,
                        LocalDate weekStart,
                        GeneralStatus generalStatus,
                        RiskLevel riskLevel,
                        ScheduleStatus scheduleStatus,
                        int page,
                        int size,
                        String sort) {
                currentUserService.checkProjectAccess(projectId);

                projectService.getProjectEntity(projectId);

                Specification<WeeklyReport> specification = Specification
                                .<WeeklyReport>where(WeeklyReportSpecifications.hasProjectId(projectId))
                                // Filtre de kayit ile ayni normalizasyondan gecer;
                                // aksi halde hafta ici bir gun secildiginde o
                                // haftanin raporu bulunamazdi.
                                .and(WeeklyReportSpecifications.hasWeekStart(
                                                toWeekStart(weekStart)))
                                .and(WeeklyReportSpecifications.hasGeneralStatus(generalStatus))
                                .and(WeeklyReportSpecifications.hasRiskLevel(riskLevel))
                                .and(WeeklyReportSpecifications.hasScheduleStatus(scheduleStatus));

                Pageable pageable = PageRequest.of(page, size, resolveSort(sort));

                Page<WeeklyReportResponse> responsePage = weeklyReportRepository
                                .findAll(specification, pageable)
                                .map(this::toResponse);

                return PagedResponse.of(responsePage);
        }

        private Sort resolveSort(String sort) {
                if (sort == null || sort.isBlank()) {
                        return Sort.by(Sort.Direction.DESC, DEFAULT_SORT_FIELD);
                }

                String[] parts = sort.split(",");
                String field = parts[0].trim();

                if (!SORTABLE_FIELDS.contains(field)) {
                        throw new IllegalArgumentException(
                                        "Geçersiz sıralama alanı: '" + field
                                                        + "'. Kullanılabilir alanlar: "
                                                        + String.join(", ", SORTABLE_FIELDS));
                }

                Sort.Direction direction = Sort.Direction.DESC;

                if (parts.length > 1) {
                        String rawDirection = parts[1].trim();

                        if (rawDirection.equalsIgnoreCase("asc")) {
                                direction = Sort.Direction.ASC;
                        } else if (rawDirection.equalsIgnoreCase("desc")) {
                                direction = Sort.Direction.DESC;
                        } else {
                                throw new IllegalArgumentException(
                                                "Geçersiz sıralama yönü: '" + rawDirection
                                                                + "'. 'asc' veya 'desc' olmalıdır.");
                        }
                }

                return Sort.by(direction, field);
        }

        @Transactional(readOnly = true)
        public WeeklyReportResponse getReportById(
                        Long projectId,
                        Long weeklyReportId) {
                currentUserService.checkProjectAccess(projectId);

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

        /**
         * Rapor kimliginden rapor varligini getirir. WorkItem ve RiskIssue
         * servisleri de bu metodu kullandigi icin kapsam (sahiplik)
         * kontrolu burada uygulanir; boylece rapora bagli alt kayitlar
         * ayri ayri kontrol edilmek zorunda kalmaz.
         */
        @Transactional(readOnly = true)
        public WeeklyReport getWeeklyReportEntity(
                        Long weeklyReportId) {
                WeeklyReport weeklyReport = weeklyReportRepository
                                .findById(weeklyReportId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Weekly report not found with id: "
                                                                + weeklyReportId));

                currentUserService.checkProjectAccess(
                                weeklyReport.getProject().getId());

                return weeklyReport;
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