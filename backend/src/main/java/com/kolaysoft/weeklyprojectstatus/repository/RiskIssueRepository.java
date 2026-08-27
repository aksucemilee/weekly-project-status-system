package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.RiskIssue;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RiskIssueRepository extends JpaRepository<RiskIssue, Long> {

    List<RiskIssue> findByWeeklyReport_Id(Long weeklyReportId);

    Optional<RiskIssue> findByIdAndWeeklyReport_Id(
            Long id,
            Long weeklyReportId);

    /**
     * Verilen raporlarin ACIK (cozulmemis) risk/engel kayitlarini TEK
     * sorguda getirir. Rapor basina ayri cagri yapilmamasi icin toplu
     * kullanilir; turetilmis risk seviyesi bu kayitlardan hesaplanir.
     */
    List<RiskIssue> findByWeeklyReport_IdInAndStatusIn(
            List<Long> weeklyReportIds,
            List<RiskIssueStatus> statuses);
}