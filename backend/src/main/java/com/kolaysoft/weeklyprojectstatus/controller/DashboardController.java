package com.kolaysoft.weeklyprojectstatus.controller;

import com.kolaysoft.weeklyprojectstatus.model.dto.dashboard.DashboardSummaryResponse;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import com.kolaysoft.weeklyprojectstatus.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    @GetMapping
    public DashboardSummaryResponse getDashboardSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,

            @RequestParam(required = false) Long projectId,

            @RequestParam(required = false) GeneralStatus generalStatus,

            @RequestParam(required = false) RiskLevel riskLevel,

            @RequestParam(required = false) ScheduleStatus scheduleStatus) {
        return dashboardService.getDashboardSummary(
                weekStart,
                projectId,
                generalStatus,
                riskLevel,
                scheduleStatus);
    }
}