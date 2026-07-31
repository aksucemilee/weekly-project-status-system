package com.kolaysoft.weeklyprojectstatus.model.dto.workitem;

import com.kolaysoft.weeklyprojectstatus.model.enums.WorkItemStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WorkItemResponse {

    private Long id;
    private Long weeklyReportId;
    private String title;
    private String description;
    private String responsible;
    private WorkItemStatus status;
    private LocalDate plannedDate;
    private LocalDate completedDate;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WorkItemResponse() {
    }

    public WorkItemResponse(
            Long id,
            Long weeklyReportId,
            String title,
            String description,
            String responsible,
            WorkItemStatus status,
            LocalDate plannedDate,
            LocalDate completedDate,
            String note,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.weeklyReportId = weeklyReportId;
        this.title = title;
        this.description = description;
        this.responsible = responsible;
        this.status = status;
        this.plannedDate = plannedDate;
        this.completedDate = completedDate;
        this.note = note;
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

    public String getResponsible() {
        return responsible;
    }

    public void setResponsible(String responsible) {
        this.responsible = responsible;
    }

    public WorkItemStatus getStatus() {
        return status;
    }

    public void setStatus(WorkItemStatus status) {
        this.status = status;
    }

    public LocalDate getPlannedDate() {
        return plannedDate;
    }

    public void setPlannedDate(LocalDate plannedDate) {
        this.plannedDate = plannedDate;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
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