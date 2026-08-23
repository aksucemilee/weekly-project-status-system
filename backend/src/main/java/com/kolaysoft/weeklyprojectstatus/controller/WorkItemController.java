package com.kolaysoft.weeklyprojectstatus.controller;

import com.kolaysoft.weeklyprojectstatus.model.dto.workitem.WorkItemCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.workitem.WorkItemResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.workitem.WorkItemUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.service.WorkItemService;
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
@RequestMapping("/api/weekly-reports/{weeklyReportId}/work-items")
public class WorkItemController {

    private final WorkItemService workItemService;

    public WorkItemController(WorkItemService workItemService) {
        this.workItemService = workItemService;
    }

    @PreAuthorize("hasAuthority('WORKITEM_MANAGE')")
    @PostMapping
    public ResponseEntity<WorkItemResponse> createWorkItem(
            @PathVariable Long weeklyReportId,
            @Valid @RequestBody WorkItemCreateRequest request) {

        WorkItemResponse createdWorkItem = workItemService.createWorkItem(
                weeklyReportId,
                request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdWorkItem);
    }

    @PreAuthorize("hasAuthority('WORKITEM_VIEW')")
    @GetMapping
    public ResponseEntity<List<WorkItemResponse>> getWorkItemsByWeeklyReport(
            @PathVariable Long weeklyReportId) {

        return ResponseEntity.ok(
                workItemService.getWorkItemsByWeeklyReport(
                        weeklyReportId));
    }

    @PreAuthorize("hasAuthority('WORKITEM_VIEW')")
    @GetMapping("/{workItemId}")
    public ResponseEntity<WorkItemResponse> getWorkItem(
            @PathVariable Long weeklyReportId,
            @PathVariable Long workItemId) {

        return ResponseEntity.ok(
                workItemService.getWorkItem(
                        weeklyReportId,
                        workItemId));
    }

    @PreAuthorize("hasAuthority('WORKITEM_MANAGE')")
    @PutMapping("/{workItemId}")
    public ResponseEntity<WorkItemResponse> updateWorkItem(
            @PathVariable Long weeklyReportId,
            @PathVariable Long workItemId,
            @Valid @RequestBody WorkItemUpdateRequest request) {

        return ResponseEntity.ok(
                workItemService.updateWorkItem(
                        weeklyReportId,
                        workItemId,
                        request));
    }

    @PreAuthorize("hasAuthority('WORKITEM_MANAGE')")
    @DeleteMapping("/{workItemId}")
    public ResponseEntity<Void> deleteWorkItem(
            @PathVariable Long weeklyReportId,
            @PathVariable Long workItemId) {

        workItemService.deleteWorkItem(
                weeklyReportId,
                workItemId);

        return ResponseEntity.noContent().build();
    }
}