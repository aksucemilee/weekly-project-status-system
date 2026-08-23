package com.kolaysoft.weeklyprojectstatus.controller;

import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.riskissue.RiskIssueUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.service.RiskIssueService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/weekly-reports/{weeklyReportId}/risk-issues")
public class RiskIssueController {

    private final RiskIssueService riskIssueService;

    public RiskIssueController(RiskIssueService riskIssueService) {
        this.riskIssueService = riskIssueService;
    }

    @PreAuthorize("hasAuthority('RISK_MANAGE')")
    @PostMapping
    public ResponseEntity<RiskIssueResponse> createRiskIssue(
            @PathVariable Long weeklyReportId,
            @Valid @RequestBody RiskIssueCreateRequest request) {

        RiskIssueResponse createdRiskIssue = riskIssueService.createRiskIssue(
                weeklyReportId,
                request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdRiskIssue);
    }

    @PreAuthorize("hasAuthority('RISK_VIEW')")
    @GetMapping
    public ResponseEntity<List<RiskIssueResponse>> getRiskIssuesByWeeklyReport(
            @PathVariable Long weeklyReportId) {

        return ResponseEntity.ok(
                riskIssueService.getRiskIssuesByWeeklyReport(
                        weeklyReportId));
    }

    @PreAuthorize("hasAuthority('RISK_VIEW')")
    @GetMapping("/{riskIssueId}")
    public ResponseEntity<RiskIssueResponse> getRiskIssue(
            @PathVariable Long weeklyReportId,
            @PathVariable Long riskIssueId) {

        return ResponseEntity.ok(
                riskIssueService.getRiskIssue(
                        weeklyReportId,
                        riskIssueId));
    }

    @PreAuthorize("hasAuthority('RISK_MANAGE')")
    @PutMapping("/{riskIssueId}")
    public ResponseEntity<RiskIssueResponse> updateRiskIssue(
            @PathVariable Long weeklyReportId,
            @PathVariable Long riskIssueId,
            @Valid @RequestBody RiskIssueUpdateRequest request) {

        return ResponseEntity.ok(
                riskIssueService.updateRiskIssue(
                        weeklyReportId,
                        riskIssueId,
                        request));
    }

    @PreAuthorize("hasAuthority('RISK_MANAGE')")
    @DeleteMapping("/{riskIssueId}")
    public ResponseEntity<Void> deleteRiskIssue(
            @PathVariable Long weeklyReportId,
            @PathVariable Long riskIssueId) {

        riskIssueService.deleteRiskIssue(
                weeklyReportId,
                riskIssueId);

        return ResponseEntity.noContent().build();
    }
}