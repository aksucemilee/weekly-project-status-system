package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueUpdateRequest;
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

    @Transactional(readOnly = true)
    public RiskIssueResponse getRiskIssue(
            Long weeklyReportId,
            Long riskIssueId) {

        RiskIssue riskIssue = getRiskIssueEntity(weeklyReportId, riskIssueId);

        return toResponse(riskIssue);
    }

    public RiskIssueResponse updateRiskIssue(
            Long weeklyReportId,
            Long riskIssueId,
            RiskIssueUpdateRequest request) {

        RiskIssue riskIssue = getRiskIssueEntity(weeklyReportId, riskIssueId);

        riskIssue.setType(request.getType());
        riskIssue.setTitle(request.getTitle());
        riskIssue.setDescription(request.getDescription());
        riskIssue.setRiskLevel(request.getRiskLevel());
        riskIssue.setActionPlan(request.getActionPlan());
        riskIssue.setResponsible(request.getResponsible());
        riskIssue.setTargetDate(request.getTargetDate());
        riskIssue.setStatus(request.getStatus());

        RiskIssue updatedRiskIssue = riskIssueRepository.save(riskIssue);

        return toResponse(updatedRiskIssue);
    }

    public void deleteRiskIssue(
            Long weeklyReportId,
            Long riskIssueId) {

        RiskIssue riskIssue = getRiskIssueEntity(weeklyReportId, riskIssueId);

        riskIssueRepository.delete(riskIssue);
    }

    private RiskIssue getRiskIssueEntity(
            Long weeklyReportId,
            Long riskIssueId) {

        // Kapsam kontrolu icin: rapor erisilebilir degilse burada 403 doner.
        weeklyReportService.getWeeklyReportEntity(weeklyReportId);

        return riskIssueRepository
                .findByIdAndWeeklyReport_Id(
                        riskIssueId,
                        weeklyReportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Risk issue not found with id: "
                                + riskIssueId
                                + " for weekly report id: "
                                + weeklyReportId));
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