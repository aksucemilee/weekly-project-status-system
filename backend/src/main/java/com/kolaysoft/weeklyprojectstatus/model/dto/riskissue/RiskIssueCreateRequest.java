package com.kolaysoft.weeklyprojectstatus.model.dto.riskissue;

import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueType;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class RiskIssueCreateRequest {

    @NotNull(message = "Risk veya engel türü zorunludur.")
    private RiskIssueType type;

    @NotBlank(message = "Risk veya engel başlığı zorunludur.")
    @Size(max = 200, message = "Risk veya engel başlığı en fazla 200 karakter olabilir.")
    private String title;

    @Size(max = 2000, message = "Açıklama en fazla 2000 karakter olabilir.")
    private String description;

    @NotNull(message = "Risk seviyesi zorunludur.")
    private RiskLevel riskLevel;

    @Size(max = 2000, message = "Aksiyon planı en fazla 2000 karakter olabilir.")
    private String actionPlan;

    @Size(max = 150, message = "Sorumlu bilgisi en fazla 150 karakter olabilir.")
    private String responsible;

    private LocalDate targetDate;

    @NotNull(message = "Risk veya engel durumu zorunludur.")
    private RiskIssueStatus status;

    public RiskIssueCreateRequest() {
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
}