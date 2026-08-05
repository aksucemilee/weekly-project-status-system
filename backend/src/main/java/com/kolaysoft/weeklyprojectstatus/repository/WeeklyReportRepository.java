package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeeklyReportRepository
                extends JpaRepository<WeeklyReport, Long> {

        List<WeeklyReport> findByProjectIdOrderByReportWeekStartDesc(
                        Long projectId);

        Optional<WeeklyReport> findFirstByProjectIdOrderByReportWeekStartDesc(
                        Long projectId);

        boolean existsByProjectIdAndReportWeekStart(
                        Long projectId,
                        LocalDate reportWeekStart);
}