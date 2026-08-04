package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.workitem.WorkItemCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.workitem.WorkItemResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.workitem.WorkItemUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.model.entity.WorkItem;
import com.kolaysoft.weeklyprojectstatus.repository.WorkItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WorkItemService {

    private final WorkItemRepository workItemRepository;
    private final WeeklyReportService weeklyReportService;

    public WorkItemService(
            WorkItemRepository workItemRepository,
            WeeklyReportService weeklyReportService) {
        this.workItemRepository = workItemRepository;
        this.weeklyReportService = weeklyReportService;
    }

    public WorkItemResponse createWorkItem(
            Long weeklyReportId,
            WorkItemCreateRequest request) {

        WeeklyReport weeklyReport = weeklyReportService.getWeeklyReportEntity(weeklyReportId);

        WorkItem workItem = new WorkItem();

        workItem.setWeeklyReport(weeklyReport);
        workItem.setTitle(request.getTitle());
        workItem.setDescription(request.getDescription());
        workItem.setResponsible(request.getResponsible());
        workItem.setStatus(request.getStatus());
        workItem.setPlannedDate(request.getPlannedDate());
        workItem.setCompletedDate(request.getCompletedDate());
        workItem.setNote(request.getNote());

        WorkItem savedWorkItem = workItemRepository.save(workItem);

        return toResponse(savedWorkItem);
    }

    @Transactional(readOnly = true)
    public List<WorkItemResponse> getWorkItemsByWeeklyReport(
            Long weeklyReportId) {

        weeklyReportService.getWeeklyReportEntity(weeklyReportId);

        return workItemRepository
                .findByWeeklyReport_Id(weeklyReportId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkItemResponse getWorkItem(
            Long weeklyReportId,
            Long workItemId) {

        WorkItem workItem = getWorkItemEntity(weeklyReportId, workItemId);

        return toResponse(workItem);
    }

    public WorkItemResponse updateWorkItem(
            Long weeklyReportId,
            Long workItemId,
            WorkItemUpdateRequest request) {

        WorkItem workItem = getWorkItemEntity(weeklyReportId, workItemId);

        workItem.setTitle(request.getTitle());
        workItem.setDescription(request.getDescription());
        workItem.setResponsible(request.getResponsible());
        workItem.setStatus(request.getStatus());
        workItem.setPlannedDate(request.getPlannedDate());
        workItem.setCompletedDate(request.getCompletedDate());
        workItem.setNote(request.getNote());

        WorkItem updatedWorkItem = workItemRepository.save(workItem);

        return toResponse(updatedWorkItem);
    }

    public void deleteWorkItem(
            Long weeklyReportId,
            Long workItemId) {

        WorkItem workItem = getWorkItemEntity(weeklyReportId, workItemId);

        workItemRepository.delete(workItem);
    }

    private WorkItem getWorkItemEntity(
            Long weeklyReportId,
            Long workItemId) {

        return workItemRepository
                .findByIdAndWeeklyReport_Id(
                        workItemId,
                        weeklyReportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Work item not found with id: "
                                + workItemId
                                + " for weekly report id: "
                                + weeklyReportId));
    }

    private WorkItemResponse toResponse(WorkItem workItem) {
        return new WorkItemResponse(
                workItem.getId(),
                workItem.getWeeklyReport().getId(),
                workItem.getTitle(),
                workItem.getDescription(),
                workItem.getResponsible(),
                workItem.getStatus(),
                workItem.getPlannedDate(),
                workItem.getCompletedDate(),
                workItem.getNote(),
                workItem.getCreatedAt(),
                workItem.getUpdatedAt());
    }
}