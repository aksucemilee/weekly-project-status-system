package com.kolaysoft.weeklyprojectstatus.model.dto.project;

import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class ProjectCreateRequest {

    @NotBlank(message = "Proje adı zorunludur.")
    @Size(max = 150, message = "Proje adı en fazla 150 karakter olabilir.")
    private String name;

    @NotBlank(message = "Müşteri adı zorunludur.")
    @Size(max = 150, message = "Müşteri adı en fazla 150 karakter olabilir.")
    private String customerName;

    private String description;
    private LocalDate startDate;
    private LocalDate targetEndDate;
    private ProjectStatus status;

    public ProjectCreateRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getTargetEndDate() {
        return targetEndDate;
    }

    public void setTargetEndDate(LocalDate targetEndDate) {
        this.targetEndDate = targetEndDate;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }
}