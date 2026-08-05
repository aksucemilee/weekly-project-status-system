package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.WorkItem;
import com.kolaysoft.weeklyprojectstatus.model.enums.WorkItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

public interface WorkItemRepository extends JpaRepository<WorkItem, Long> {

        List<WorkItem> findByWeeklyReport_Id(Long weeklyReportId);

        Optional<WorkItem> findByIdAndWeeklyReport_Id(
                        Long id,
                        Long weeklyReportId);

        long countByWeeklyReport_IdAndStatusIn(
                        Long weeklyReportId,
                        Collection<WorkItemStatus> statuses);
}