package com.kolaysoft.weeklyprojectstatus.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.security.AppUserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

/**
 * HTTP katmani testleri icin ortak kurulum.
 *
 * Gercek guvenlik zinciri (@PreAuthorize, CSRF, GlobalExceptionHandler)
 * calisir; boylece servis testlerinin kapsamadigi katman -- exception'in
 * hangi HTTP koduna cevrildigi ve endpoint'in hangi yetkiyi istedigi --
 * dogrulanir.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class ApiTestBase {

    @Autowired
    protected MockMvc mockMvc;

    /** Kendi ornegimiz: uygulama baglaminda ObjectMapper bean'i yok. */
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    protected TestDataFactory data;

    /** Verilen kullanici olarak, CSRF token'i ile istek yapar. */
    protected RequestPostProcessor as(User user) {
        AppUserPrincipal principal = new AppUserPrincipal(user);

        return request -> {
            authentication(new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities())).postProcessRequest(request);

            return csrf().postProcessRequest(request);
        };
    }

    protected String json(Object body) {
        try {
            return objectMapper.writeValueAsString(body);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
