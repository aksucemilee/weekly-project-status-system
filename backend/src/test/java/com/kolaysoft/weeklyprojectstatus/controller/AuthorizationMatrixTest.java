package com.kolaysoft.weeklyprojectstatus.controller;

import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import com.kolaysoft.weeklyprojectstatus.support.ApiTestBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * docs/t14-authorization-matrix.md bolum 7'deki API yetki matrisinin
 * yurutulebilir karsiligi.
 *
 * Matris bir dokumandi; bu sinif onu koda baglar, boylece bir
 * @PreAuthorize anotasyonu yanlislikla degistirilirse test kirmizi yanar.
 */
class AuthorizationMatrixTest extends ApiTestBase {

    private Project project;
    private User projectManager;
    private User cto;
    private User admin;
    private User teamLead;

    @BeforeEach
    void setUp() {
        project = data.project("Yetki Testi");

        projectManager = data.user("pm@test.local", RoleCode.PROJE_YONETICISI,
                PermissionCode.PROJECT_VIEW,
                PermissionCode.REPORT_VIEW,
                PermissionCode.REPORT_CREATE,
                PermissionCode.REPORT_UPDATE,
                PermissionCode.WORKITEM_VIEW,
                PermissionCode.WORKITEM_MANAGE,
                PermissionCode.RISK_VIEW,
                PermissionCode.RISK_MANAGE);

        cto = data.user("cto@test.local", RoleCode.CTO,
                PermissionCode.PROJECT_VIEW,
                PermissionCode.REPORT_VIEW,
                PermissionCode.WORKITEM_VIEW,
                PermissionCode.RISK_VIEW,
                PermissionCode.DASHBOARD_VIEW);

        admin = data.user("admin@test.local", RoleCode.ADMIN,
                PermissionCode.PROJECT_VIEW,
                PermissionCode.PROJECT_MANAGE,
                PermissionCode.REPORT_VIEW,
                PermissionCode.USER_MANAGE,
                PermissionCode.ASSIGNMENT_MANAGE);

        teamLead = data.user("lider@test.local", RoleCode.EKIP_LIDERI,
                PermissionCode.PROJECT_VIEW,
                PermissionCode.REPORT_VIEW,
                PermissionCode.WORKITEM_VIEW,
                PermissionCode.RISK_VIEW);

        data.assign(project, projectManager);
        data.assign(project, teamLead);
    }

    private String reportJson() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("reportWeekStart", "2026-07-13");
        body.put("targetProgress", 50);
        body.put("actualProgress", 40);
        body.put("generalStatus", "IN_PROGRESS");
        body.put("scheduleStatus", "ON_TRACK");
        body.put("completedSummary", "Yapılanlar");
        body.put("nextWeekPlan", "Yapılacaklar");

        return json(body);
    }

    private String workItemJson() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", "İş kalemi");
        body.put("status", "PLANNED");

        return json(body);
    }

    private String riskJson() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("type", "RISK");
        body.put("title", "Risk");
        body.put("riskLevel", "LOW");
        body.put("status", "OPEN");

        return json(body);
    }

    private String projectJson() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", "Yeni Proje");
        body.put("customerName", "Demo Müşteri");
        body.put("status", "ACTIVE");
        body.put("active", true);

        return json(body);
    }

    // --- Rapor olusturma: yalnizca REPORT_CREATE (PY) ---

    @Test
    @DisplayName("Rapor olusturma: PY basarili, CTO/Admin/EL 403")
    void reportCreationIsRestrictedToProjectManager() throws Exception {
        mockMvc.perform(post("/api/projects/{id}/weekly-reports", project.getId())
                .with(as(projectManager)).contentType(APPLICATION_JSON).content(reportJson()))
                .andExpect(status().isCreated());

        for (User denied : new User[] { cto, admin, teamLead }) {
            mockMvc.perform(post("/api/projects/{id}/weekly-reports", project.getId())
                    .with(as(denied)).contentType(APPLICATION_JSON).content(reportJson()))
                    .andExpect(status().isForbidden());
        }
    }

    // --- Rapor guncelleme: yalnizca REPORT_UPDATE (PY) ---

    @Test
    @DisplayName("Rapor guncelleme: CTO/Admin/EL 403")
    void reportUpdateIsRestrictedToProjectManager() throws Exception {
        for (User denied : new User[] { cto, admin, teamLead }) {
            mockMvc.perform(put("/api/projects/{p}/weekly-reports/{r}", project.getId(), 1)
                    .with(as(denied)).contentType(APPLICATION_JSON).content(reportJson()))
                    .andExpect(status().isForbidden());
        }
    }

    // --- Proje yonetimi: yalnizca PROJECT_MANAGE (Admin) ---

    @Test
    @DisplayName("Proje olusturma: yalnizca Admin")
    void projectCreationIsAdminOnly() throws Exception {
        mockMvc.perform(post("/api/projects")
                .with(as(admin)).contentType(APPLICATION_JSON).content(projectJson()))
                .andExpect(status().isCreated());

        for (User denied : new User[] { projectManager, cto, teamLead }) {
            mockMvc.perform(post("/api/projects")
                    .with(as(denied)).contentType(APPLICATION_JSON).content(projectJson()))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Proje guncelleme: yalnizca Admin")
    void projectUpdateIsAdminOnly() throws Exception {
        mockMvc.perform(put("/api/projects/{id}", project.getId())
                .with(as(admin)).contentType(APPLICATION_JSON).content(projectJson()))
                .andExpect(status().isOk());

        for (User denied : new User[] { projectManager, cto, teamLead }) {
            mockMvc.perform(put("/api/projects/{id}", project.getId())
                    .with(as(denied)).contentType(APPLICATION_JSON).content(projectJson()))
                    .andExpect(status().isForbidden());
        }
    }

    // --- Dashboard: yalnizca DASHBOARD_VIEW (CTO) ---

    @Test
    @DisplayName("Dashboard: yalnizca CTO erisir")
    void dashboardIsCtoOnly() throws Exception {
        mockMvc.perform(get("/api/dashboard").with(as(cto)))
                .andExpect(status().isOk());

        for (User denied : new User[] { projectManager, admin, teamLead }) {
            mockMvc.perform(get("/api/dashboard").with(as(denied)))
                    .andExpect(status().isForbidden());
        }
    }

    // --- Admin ekrani: yalnizca USER_MANAGE (Admin) ---

    @Test
    @DisplayName("Kullanici listesi: yalnizca Admin")
    void userManagementIsAdminOnly() throws Exception {
        mockMvc.perform(get("/api/admin/users").with(as(admin)))
                .andExpect(status().isOk());

        for (User denied : new User[] { projectManager, cto, teamLead }) {
            mockMvc.perform(get("/api/admin/users").with(as(denied)))
                    .andExpect(status().isForbidden());
        }
    }

    // --- Is kalemi ve risk: yonetim yalnizca PY, goruntuleme Admin haric ---

    @Test
    @DisplayName("Is kalemi yonetimi: Admin ve CTO 403")
    void workItemManagementIsRestricted() throws Exception {
        mockMvc.perform(post("/api/weekly-reports/{r}/work-items", 1)
                .with(as(cto)).contentType(APPLICATION_JSON).content(workItemJson()))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/weekly-reports/{r}/work-items", 1)
                .with(as(admin)).contentType(APPLICATION_JSON).content(workItemJson()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Is kalemi goruntuleme: Admin'in WORKITEM_VIEW yetkisi yok -> 403")
    void adminCannotViewWorkItems() throws Exception {
        mockMvc.perform(get("/api/weekly-reports/{r}/work-items", 1)
                .with(as(admin)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Risk yonetimi: EL salt okunur -> 403")
    void teamLeadCannotManageRisks() throws Exception {
        mockMvc.perform(post("/api/weekly-reports/{r}/risk-issues", 1)
                .with(as(teamLead)).contentType(APPLICATION_JSON).content(riskJson()))
                .andExpect(status().isForbidden());
    }

    // --- Proje listeleme: dort rol de gorur, kapsam farkli ---

    @Test
    @DisplayName("Proje listeleme: dort rol de erisir")
    void projectListIsVisibleToAllRoles() throws Exception {
        for (User allowed : new User[] { projectManager, cto, admin, teamLead }) {
            mockMvc.perform(get("/api/projects").with(as(allowed)))
                    .andExpect(status().isOk());
        }
    }
}
