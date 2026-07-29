package com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport;

import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WeeklyReportResponse {

    private Long id;
    private Long projectId;
    private String projectName;
    private LocalDate reportWeekStart;
    private Integer targetProgress;
    private Integer actualProgress;
    private GeneralStatus generalStatus;
    private ScheduleStatus scheduleStatus;
    private RiskLevel riskLevel;
    private String completedSummary;
    private String nextWeekPlan;
    private String generalNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WeeklyReportResponse() {
    }

    public WeeklyReportResponse(
            Long id,
            Long projectId,
            String projectName,
            LocalDate reportWeekStart,
            Integer targetProgress,
            Integer actualProgress,
            GeneralStatus generalStatus,
            ScheduleStatus scheduleStatus,
            RiskLevel riskLevel,
            String completedSummary,
            String nextWeekPlan,
            String generalNote,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.reportWeekStart = reportWeekStart;
        this.targetProgress = targetProgress;
        this.actualProgress = actualProgress;
        this.generalStatus = generalStatus;
        this.scheduleStatus = scheduleStatus;
        this.riskLevel = riskLevel;
        this.completedSummary = completedSummary;
        this.nextWeekPlan = nextWeekPlan;
        this.generalNote = generalNote;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public LocalDate getReportWeekStart() {
        return reportWeekStart;
    }

    public void setReportWeekStart(LocalDate reportWeekStart) {
        this.reportWeekStart = reportWeekStart;
    }

    public Integer getTargetProgress() {
        return targetProgress;
    }

    public void setTargetProgress(Integer targetProgress) {
        this.targetProgress = targetProgress;
    }

    public Integer getActualProgress() {
        return actualProgress;
    }

    public void setActualProgress(Integer actualProgress) {
        this.actualProgress = actualProgress;
    }

    public GeneralStatus getGeneralStatus() {
        return generalStatus;
    }

    public void setGeneralStatus(GeneralStatus generalStatus) {
        this.generalStatus = generalStatus;
    }

    public ScheduleStatus getScheduleStatus() {
        return scheduleStatus;
    }

    public void setScheduleStatus(ScheduleStatus scheduleStatus) {
        this.scheduleStatus = scheduleStatus;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getCompletedSummary() {
        return completedSummary;
    }

    public void setCompletedSummary(String completedSummary) {
        this.completedSummary = completedSummary;
    }

    public String getNextWeekPlan() {
        return nextWeekPlan;
    }

    public void setNextWeekPlan(String nextWeekPlan) {
        this.nextWeekPlan = nextWeekPlan;
    }

    public String getGeneralNote() {
        return generalNote;
    }

    public void setGeneralNote(String generalNote) {
        this.generalNote = generalNote;
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