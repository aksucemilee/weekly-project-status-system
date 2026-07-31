package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.RiskIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiskIssueRepository extends JpaRepository<RiskIssue, Long> {

    List<RiskIssue> findByWeeklyReport_Id(Long weeklyReportId);
}