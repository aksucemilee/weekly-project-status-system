package com.kolaysoft.weeklyprojectstatus.controller;

import com.kolaysoft.weeklyprojectstatus.model.dto.common.PagedResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport.WeeklyReportResponse;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import com.kolaysoft.weeklyprojectstatus.service.WeeklyReportService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/projects/{projectId}/weekly-reports")
public class WeeklyReportController {

        private final WeeklyReportService weeklyReportService;

        public WeeklyReportController(
                        WeeklyReportService weeklyReportService) {
                this.weeklyReportService = weeklyReportService;
        }

        @PreAuthorize("hasAuthority('REPORT_CREATE')")
        @PostMapping
        public ResponseEntity<WeeklyReportResponse> createWeeklyReport(
                        @PathVariable Long projectId,
                        @Valid @RequestBody WeeklyReportCreateRequest request) {
                WeeklyReportResponse createdReport = weeklyReportService.createWeeklyReport(
                                projectId,
                                request);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(createdReport);
        }

        @PreAuthorize("hasAuthority('REPORT_VIEW')")
        @GetMapping
        public ResponseEntity<PagedResponse<WeeklyReportResponse>> getReportsByProject(
                        @PathVariable Long projectId,

                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,

                        @RequestParam(required = false) GeneralStatus generalStatus,

                        @RequestParam(required = false) RiskLevel riskLevel,

                        @RequestParam(required = false) ScheduleStatus scheduleStatus,

                        @RequestParam(defaultValue = "0") int page,

                        @RequestParam(defaultValue = "20") int size,

                        @RequestParam(required = false) String sort) {
                return ResponseEntity.ok(
                                weeklyReportService.getReportsByProject(
                                                projectId,
                                                weekStart,
                                                generalStatus,
                                                riskLevel,
                                                scheduleStatus,
                                                page,
                                                size,
                                                sort));
        }

        @PreAuthorize("hasAuthority('REPORT_VIEW')")
        @GetMapping("/{weeklyReportId}")
        public ResponseEntity<WeeklyReportResponse> getReportById(
                        @PathVariable Long projectId,
                        @PathVariable Long weeklyReportId) {
                return ResponseEntity.ok(
                                weeklyReportService.getReportById(
                                                projectId,
                                                weeklyReportId));
        }
}