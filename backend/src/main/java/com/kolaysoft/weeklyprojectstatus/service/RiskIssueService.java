package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueResponse;
import com.kolaysoft.weeklyprojectstatus.model.entity.RiskIssue;
import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.repository.RiskIssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RiskIssueService {

    private final RiskIssueRepository riskIssueRepository;
    private final WeeklyReportService weeklyReportService;

    public RiskIssueService(
            RiskIssueRepository riskIssueRepository,
            WeeklyReportService weeklyReportService) {
        this.riskIssueRepository = riskIssueRepository;
        this.weeklyReportService = weeklyReportService;
    }

    public RiskIssueResponse createRiskIssue(
            Long weeklyReportId,
            RiskIssueCreateRequest request) {

        WeeklyReport weeklyReport = weeklyReportService.getWeeklyReportEntity(weeklyReportId);

        RiskIssue riskIssue = new RiskIssue();

        riskIssue.setWeeklyReport(weeklyReport);
        riskIssue.setType(request.getType());
        riskIssue.setTitle(request.getTitle());
        riskIssue.setDescription(request.getDescription());
        riskIssue.setRiskLevel(request.getRiskLevel());
        riskIssue.setActionPlan(request.getActionPlan());
        riskIssue.setResponsible(request.getResponsible());
        riskIssue.setTargetDate(request.getTargetDate());
        riskIssue.setStatus(request.getStatus());

        RiskIssue savedRiskIssue = riskIssueRepository.save(riskIssue);

        return toResponse(savedRiskIssue);
    }

    @Transactional(readOnly = true)
    public List<RiskIssueResponse> getRiskIssuesByWeeklyReport(
            Long weeklyReportId) {

        weeklyReportService.getWeeklyReportEntity(weeklyReportId);

        return riskIssueRepository
                .findByWeeklyReport_Id(weeklyReportId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RiskIssueResponse toResponse(RiskIssue riskIssue) {
        return new RiskIssueResponse(
                riskIssue.getId(),
                riskIssue.getWeeklyReport().getId(),
                riskIssue.getType(),
                riskIssue.getTitle(),
                riskIssue.getDescription(),
                riskIssue.getRiskLevel(),
                riskIssue.getActionPlan(),
                riskIssue.getResponsible(),
                riskIssue.getTargetDate(),
                riskIssue.getStatus(),
                riskIssue.getCreatedAt(),
                riskIssue.getUpdatedAt());
    }
}