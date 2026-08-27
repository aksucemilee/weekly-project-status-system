package com.kolaysoft.weeklyprojectstatus.controller;

import com.kolaysoft.weeklyprojectstatus.support.ApiTestBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Guvenlik sertlestirmeleri (denetim maddeleri 5 ve 9).
 *
 * Giris denemesi siniri testte 3 olarak ayarlanir; boylece kural
 * varsayilan degerden bagimsiz dogrulanir.
 */
@TestPropertySource(properties = {
        "security.login.max-attempts=3",
        "security.login.window-minutes=15"
})
class SecurityHardeningTest extends ApiTestBase {

    private String loginBody(String email) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("email", email);
        body.put("password", "yanlis-parola");

        return json(body);
    }

    // --- Madde 5: brute-force korumasi ---

    @Test
    @DisplayName("Sinir asildiginda giris istegi 429 doner")
    void loginIsRateLimited() throws Exception {
        // Ilk uc deneme kimlik dogrulamaya ulasir ve 401 alir.
        for (int attempt = 0; attempt < 3; attempt++) {
            mockMvc.perform(post("/api/auth/login")
                    .with(csrf())
                    .contentType(APPLICATION_JSON)
                    .content(loginBody("yok@test.local")))
                    .andExpect(status().isUnauthorized());
        }

        // Dorduncu deneme sinira takilir; parola hic kontrol edilmez.
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(loginBody("yok@test.local")))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    @DisplayName("Sinir yalnizca giris ucuna uygulanir")
    void rateLimitDoesNotAffectOtherEndpoints() throws Exception {
        for (int attempt = 0; attempt < 10; attempt++) {
            mockMvc.perform(get("/api/health"))
                    .andExpect(status().isOk());
        }
    }

    // --- Madde 9: guvenlik basliklari ---

    @Test
    @DisplayName("Content-Security-Policy gonderilir")
    void contentSecurityPolicyIsSent() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().string(
                        "Content-Security-Policy",
                        org.hamcrest.Matchers.containsString("default-src 'self'")))
                .andExpect(header().string(
                        "Content-Security-Policy",
                        org.hamcrest.Matchers.containsString("frame-ancestors 'none'")));
    }

    @Test
    @DisplayName("Referrer-Policy gonderilir")
    void referrerPolicyIsSent() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().string(
                        "Referrer-Policy",
                        "strict-origin-when-cross-origin"));
    }

    @Test
    @DisplayName("Spring Security varsayilan basliklari korunur")
    void defaultSecurityHeadersRemain() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    }

    @Test
    @DisplayName("HSTS lokal profilde gonderilmez")
    void hstsIsDisabledWithoutProductionHardening() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().doesNotExist("Strict-Transport-Security"));
    }
}
