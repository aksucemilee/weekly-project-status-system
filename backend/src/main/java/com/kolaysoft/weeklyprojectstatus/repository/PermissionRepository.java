package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.Permission;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByCode(PermissionCode code);
}
