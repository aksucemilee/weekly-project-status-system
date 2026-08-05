package com.kolaysoft.weeklyprojectstatus.model.dto.dashboard;

import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;

import java.time.LocalDate;

public record DashboardProjectSummaryResponse(
        Long projectId,
        String projectName,
        String customerName,
        ProjectStatus projectStatus,
        Long latestReportId,
        LocalDate reportWeekStart,
        Integer targetProgress,
        Integer actualProgress,
        GeneralStatus generalStatus,
        ScheduleStatus scheduleStatus,
        RiskLevel riskLevel,
        long activeWorkItemCount) {
}