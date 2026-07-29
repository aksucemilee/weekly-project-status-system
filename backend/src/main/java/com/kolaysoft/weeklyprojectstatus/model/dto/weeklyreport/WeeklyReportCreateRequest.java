package com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport;

import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;

import java.time.LocalDate;

public class WeeklyReportCreateRequest {

    private LocalDate reportWeekStart;
    private Integer targetProgress;
    private Integer actualProgress;
    private GeneralStatus generalStatus;
    private ScheduleStatus scheduleStatus;
    private RiskLevel riskLevel;
    private String completedSummary;
    private String nextWeekPlan;
    private String blockers;
    private String generalNote;

    public WeeklyReportCreateRequest() {
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

    public String getBlockers() {
        return blockers;
    }

    public void setBlockers(String blockers) {
        this.blockers = blockers;
    }

    public String getGeneralNote() {
        return generalNote;
    }

    public void setGeneralNote(String generalNote) {
        this.generalNote = generalNote;
    }
}