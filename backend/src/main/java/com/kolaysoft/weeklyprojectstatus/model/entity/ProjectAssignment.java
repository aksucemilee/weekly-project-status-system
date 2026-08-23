package com.kolaysoft.weeklyprojectstatus.model.entity;

import com.kolaysoft.weeklyprojectstatus.model.enums.AssignmentRole;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Kullanici ile proje arasindaki sorumluluk iliskisi. Kapsam (sahiplik)
 * kontrolu bu tablo uzerinden yapilir: bir kullanicinin erisebildigi proje
 * kumesi, aktif atamalarindan olusur.
 */
/*
 * Not: "ayni kullanici-proje icin ikinci AKTIF atama" kurali veritabani
 * unique constraint'i ile ifade edilemiyor (kismi index gerektirir, JPA
 * uzerinden tasinabilir degil). Bu nedenle kural servis katmaninda
 * kontrol edilir ve ihlalinde 409 doner.
 */
@Entity
@Table(name = "project_assignments")
public class ProjectAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_role", nullable = false, length = 40)
    private AssignmentRole assignmentRole;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ProjectAssignment() {
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public AssignmentRole getAssignmentRole() {
        return assignmentRole;
    }

    public void setAssignmentRole(AssignmentRole assignmentRole) {
        this.assignmentRole = assignmentRole;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
