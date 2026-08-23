package com.kolaysoft.weeklyprojectstatus.model.entity;

import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import jakarta.persistence.*;

@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 40)
    private PermissionCode code;

    public Permission() {
    }

    public Permission(PermissionCode code) {
        this.code = code;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PermissionCode getCode() {
        return code;
    }

    public void setCode(PermissionCode code) {
        this.code = code;
    }
}
