package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.Optional;

public interface WeeklyReportRepository
                extends JpaRepository<WeeklyReport, Long>,
                JpaSpecificationExecutor<WeeklyReport> {

        Optional<WeeklyReport> findByIdAndProject_Id(
                        Long id,
                        Long projectId);

        boolean existsByProjectIdAndReportWeekStart(
                        Long projectId,
                        LocalDate reportWeekStart);
}