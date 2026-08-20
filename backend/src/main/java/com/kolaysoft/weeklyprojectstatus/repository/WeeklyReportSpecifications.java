package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

/**
 * T13 filtre sozlesmesine gore WeeklyReport icin opsiyonel, birlikte
 * kullanilabilir (AND) Specification parcalari. Her metot deger null ise
 * predicate uretmez (Specification.and() null predicate'i yok sayar), boylece
 * filtreler opsiyonel kalir.
 */
public final class WeeklyReportSpecifications {

        private WeeklyReportSpecifications() {
        }

        public static Specification<WeeklyReport> hasProjectId(Long projectId) {
                return (root, query, cb) -> projectId == null
                                ? null
                                : cb.equal(root.get("project").get("id"), projectId);
        }

        public static Specification<WeeklyReport> projectIdIn(List<Long> projectIds) {
                return (root, query, cb) -> (projectIds == null || projectIds.isEmpty())
                                ? cb.disjunction()
                                : root.get("project").get("id").in(projectIds);
        }

        public static Specification<WeeklyReport> hasWeekStart(LocalDate weekStart) {
                return (root, query, cb) -> weekStart == null
                                ? null
                                : cb.equal(root.get("reportWeekStart"), weekStart);
        }

        public static Specification<WeeklyReport> weekStartBetween(
                        LocalDate weekStart,
                        LocalDate weekEnd) {
                return (root, query, cb) -> (weekStart == null || weekEnd == null)
                                ? null
                                : cb.between(root.get("reportWeekStart"), weekStart, weekEnd);
        }

        public static Specification<WeeklyReport> hasGeneralStatus(GeneralStatus generalStatus) {
                return (root, query, cb) -> generalStatus == null
                                ? null
                                : cb.equal(root.get("generalStatus"), generalStatus);
        }

        public static Specification<WeeklyReport> hasRiskLevel(RiskLevel riskLevel) {
                return (root, query, cb) -> riskLevel == null
                                ? null
                                : cb.equal(root.get("riskLevel"), riskLevel);
        }

        public static Specification<WeeklyReport> hasScheduleStatus(ScheduleStatus scheduleStatus) {
                return (root, query, cb) -> scheduleStatus == null
                                ? null
                                : cb.equal(root.get("scheduleStatus"), scheduleStatus);
        }
}
