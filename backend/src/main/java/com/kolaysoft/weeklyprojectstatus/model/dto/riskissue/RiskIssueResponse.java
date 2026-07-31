package com.kolaysoft.weeklyprojectstatus.model.dto.riskissue;

import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueType;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RiskIssueResponse {

    private Long id;
    private Long weeklyReportId;
    private RiskIssueType type;
    private String title;
    private String description;
    private RiskLevel riskLevel;
    private String actionPlan;
    private String responsible;
    private LocalDate targetDate;
    private RiskIssueStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RiskIssueResponse() {
    }

    public RiskIssueResponse(
            Long id,
            Long weeklyReportId,
            RiskIssueType type,
            String title,
            String description,
            RiskLevel riskLevel,
            String actionPlan,
            String responsible,
            LocalDate targetDate,
            RiskIssueStatus status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.weeklyReportId = weeklyReportId;
        this.type = type;
        this.title = title;
        this.description = description;
        this.riskLevel = riskLevel;
        this.actionPlan = actionPlan;
        this.responsible = responsible;
        this.targetDate = targetDate;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWeeklyReportId() {
        return weeklyReportId;
    }

    public void setWeeklyReportId(Long weeklyReportId) {
        this.weeklyReportId = weeklyReportId;
    }

    public RiskIssueType getType() {
        return type;
    }

    public void setType(RiskIssueType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getActionPlan() {
        return actionPlan;
    }

    public void setActionPlan(String actionPlan) {
        this.actionPlan = actionPlan;
    }

    public String getResponsible() {
        return responsible;
    }

    public void setResponsible(String responsible) {
        this.responsible = responsible;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public RiskIssueStatus getStatus() {
        return status;
    }

    public void setStatus(RiskIssueStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}