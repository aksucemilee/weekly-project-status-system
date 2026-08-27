package com.kolaysoft.weeklyprojectstatus.model.dto.weeklyreport;

import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class WeeklyReportCreateRequest {

    @NotNull(message = "Rapor haftası zorunludur.")
    private LocalDate reportWeekStart;

    @NotNull(message = "Hedeflenen ilerleme zorunludur.")
    @Min(value = 0, message = "Hedeflenen ilerleme 0 veya daha büyük olmalıdır.")
    @Max(value = 100, message = "Hedeflenen ilerleme 100 veya daha küçük olmalıdır.")
    private Integer targetProgress;

    @NotNull(message = "Gerçekleşen ilerleme zorunludur.")
    @Min(value = 0, message = "Gerçekleşen ilerleme 0 veya daha büyük olmalıdır.")
    @Max(value = 100, message = "Gerçekleşen ilerleme 100 veya daha küçük olmalıdır.")
    private Integer actualProgress;

    @NotNull(message = "Genel durum zorunludur.")
    private GeneralStatus generalStatus;

    @NotNull(message = "Takvim durumu zorunludur.")
    private ScheduleStatus scheduleStatus;

    @NotBlank(message = "Yapılanlar alanı zorunludur.")
    private String completedSummary;

    @NotBlank(message = "Gelecek hafta yapılacaklar alanı zorunludur.")
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