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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exception -> HTTP kodu eslemesi (GlobalExceptionHandler).
 *
 * Servis testleri yalnizca dogru exception'in firladigini dogrular;
 * bu sinif o exception'in istemciye hangi kodla dondugunu dogrular.
 */
class HttpStatusMappingTest extends ApiTestBase {

    private Project project;
    private User projectManager;

    @BeforeEach
    void setUp() {
        project = data.project("Durum Kodu Testi");
        projectManager = data.user(
                "pm@test.local",
                RoleCode.PROJE_YONETICISI,
                PermissionCode.REPORT_CREATE,
                PermissionCode.REPORT_VIEW);
        data.assign(project, projectManager);
    }

    private Map<String, Object> reportBody(String week, int target) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("reportWeekStart", week);
        body.put("targetProgress", target);
        body.put("actualProgress", 40);
        body.put("generalStatus", "IN_PROGRESS");
        body.put("scheduleStatus", "ON_TRACK");
        body.put("completedSummary", "Yapılanlar");
        body.put("nextWeekPlan", "Yapılacaklar");

        return body;
    }

    private void createReport(String week) throws Exception {
        mockMvc.perform(post("/api/projects/{id}/weekly-reports", project.getId())
                .with(as(projectManager))
                .contentType(APPLICATION_JSON)
                .content(json(reportBody(week, 50))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Ayni haftaya ikinci rapor -> 409")
    void duplicateWeekReturnsConflict() throws Exception {
        createReport("2026-07-13");

        mockMvc.perform(post("/api/projects/{id}/weekly-reports", project.getId())
                .with(as(projectManager))
                .contentType(APPLICATION_JSON)
                .content(json(reportBody("2026-07-16", 50))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("Ilerleme 100'den buyuk -> 400 ve alan mesaji")
    void invalidProgressReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/projects/{id}/weekly-reports", project.getId())
                .with(as(projectManager))
                .contentType(APPLICATION_JSON)
                .content(json(reportBody("2026-07-13", 120))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("100 veya daha küçük")));
    }

    @Test
    @DisplayName("Tanimsiz enum degeri -> 400")
    void unknownEnumValueReturnsBadRequest() throws Exception {
        Map<String, Object> body = reportBody("2026-07-13", 50);
        body.put("generalStatus", "AT_RISK");

        mockMvc.perform(post("/api/projects/{id}/weekly-reports", project.getId())
                .with(as(projectManager))
                .contentType(APPLICATION_JSON)
                .content(json(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Var olmayan rapor -> 404")
    void missingReportReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/projects/{p}/weekly-reports/{r}",
                project.getId(), 999999)
                .with(as(projectManager)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Desteklenmeyen HTTP metodu -> 405")
    void unsupportedMethodReturnsMethodNotAllowed() throws Exception {
        mockMvc.perform(delete("/api/projects/{id}", project.getId())
                .with(as(projectManager)))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @DisplayName("Sayisal olmasi gereken path degeri metin -> 400")
    void invalidPathTypeReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/projects/abc")
                .with(as(projectManager)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Kapsam disi proje -> 403")
    void outOfScopeProjectReturnsForbidden() throws Exception {
        Project other = data.project("Atanmamış Proje");

        mockMvc.perform(get("/api/projects/{id}/weekly-reports", other.getId())
                .with(as(projectManager)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Oturumsuz istek -> 401")
    void anonymousRequestReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Gecersiz sort alani -> 400")
    void invalidSortReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/projects/{id}/weekly-reports", project.getId())
                .param("sort", "hacked,asc")
                .with(as(projectManager)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Health endpointi oturumsuz erisilebilir -> 200")
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }
}
