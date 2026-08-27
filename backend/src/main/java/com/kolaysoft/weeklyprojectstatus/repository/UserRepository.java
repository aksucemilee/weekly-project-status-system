package com.kolaysoft.weeklyprojectstatus.repository;

import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByOrderByEmailAsc();

    /**
     * Belirtilen roldeki aktif kullanici sayisi. Sistemde en az bir aktif
     * admin kalmasini garanti etmek icin kullanilir.
     */
    long countByRole_CodeAndActiveTrue(RoleCode roleCode);
}
