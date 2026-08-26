package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.ProjectAssignment;
import com.kolaysoft.weeklyprojectstatus.model.enums.AssignmentRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProjectAssignmentRepository
                extends JpaRepository<ProjectAssignment, Long> {

        boolean existsByProject_IdAndUser_IdAndActiveTrue(
                        Long projectId,
                        Long userId);

        List<ProjectAssignment> findByUser_IdAndActiveTrue(Long userId);

        /**
         * Verilen projelerin sorumlularini TEK sorguda getirir; proje basina
         * ayri cagri yapilmamasi icin toplu kullanilir.
         */
        List<ProjectAssignment> findByActiveTrueAndAssignmentRoleAndProject_IdIn(
                        AssignmentRole assignmentRole,
                        List<Long> projectIds);

        /**
         * Kullanicinin erisebildigi proje id kumesi. Kapsam (sahiplik)
         * kontrolu ve T13'te hazirlanan
         * WeeklyReportSpecifications.projectIdIn(...) zinciri bu listeyi
         * kullanir.
         */
        @Query("select a.project.id from ProjectAssignment a "
                        + "where a.user.id = :userId and a.active = true")
        List<Long> findAllowedProjectIds(Long userId);
}
