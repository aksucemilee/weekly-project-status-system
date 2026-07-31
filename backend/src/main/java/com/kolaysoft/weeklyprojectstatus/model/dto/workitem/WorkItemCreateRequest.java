package com.kolaysoft.weeklyprojectstatus.model.dto.workitem;

import com.kolaysoft.weeklyprojectstatus.model.enums.WorkItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class WorkItemCreateRequest {

    @NotBlank(message = "İş kalemi başlığı zorunludur.")
    @Size(max = 200, message = "İş kalemi başlığı en fazla 200 karakter olabilir.")
    private String title;

    @Size(max = 2000, message = "Açıklama en fazla 2000 karakter olabilir.")
    private String description;

    @Size(max = 150, message = "Sorumlu bilgisi en fazla 150 karakter olabilir.")
    private String responsible;

    @NotNull(message = "İş kalemi durumu zorunludur.")
    private WorkItemStatus status;

    private LocalDate plannedDate;
    private LocalDate completedDate;

    @Size(max = 2000, message = "Not alanı en fazla 2000 karakter olabilir.")
    private String note;

    public WorkItemCreateRequest() {
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
}