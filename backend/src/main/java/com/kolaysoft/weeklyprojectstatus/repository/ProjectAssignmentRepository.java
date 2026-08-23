package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectAssignmentRepository
                extends JpaRepository<ProjectAssignment, Long> {

        boolean existsByProject_IdAndUser_IdAndActiveTrue(
                        Long projectId,
                        Long userId);

        Optional<ProjectAssignment> findByIdAndActiveTrue(Long id);

        List<ProjectAssignment> findByUser_IdAndActiveTrue(Long userId);

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
