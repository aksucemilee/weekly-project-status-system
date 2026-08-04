package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.WorkItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkItemRepository extends JpaRepository<WorkItem, Long> {

    List<WorkItem> findByWeeklyReport_Id(Long weeklyReportId);

    Optional<WorkItem> findByIdAndWeeklyReport_Id(
            Long id,
            Long weeklyReportId);
}