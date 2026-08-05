package com.kolaysoft.weeklyprojectstatus.model.dto.dashboard;

import java.util.List;

public record DashboardSummaryResponse(
        long totalProjects,
        long projectsWithReports,
        long highRiskProjects,
        long delayedProjects,
        long blockedProjects,
        List<DashboardProjectSummaryResponse> projects) {
}