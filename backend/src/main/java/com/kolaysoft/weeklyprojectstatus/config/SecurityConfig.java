package com.kolaysoft.weeklyprojectstatus.config;

import com.kolaysoft.weeklyprojectstatus.security.LoginRateLimitFilter;
import com.kolaysoft.weeklyprojectstatus.security.SpaCsrfConfigurer;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.HstsConfig;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Filtre zincirinde olusan kimlik/yetki hatalari da mevcut
     * GlobalExceptionHandler'a delege edilir. Boylece hata govdesi
     * (ApiErrorResponse) tek yerden uretilir; guvenlik katmani icin ayri
     * bir JSON serilestirme kodu tutulmaz.
     */
    private final HandlerExceptionResolver handlerExceptionResolver;
    private final LoginRateLimitFilter loginRateLimitFilter;

    /**
     * Uretimde HSTS ve CSP gibi basliklarin acilmasi icin kullanilir.
     * Varsayilan false: lokal demo HTTP uzerinden calisir ve HSTS
     * tarayiciyi bu host icin HTTPS'e kilitleyerek gelistirmeyi bozar.
     */
    @Value("${security.production-hardening:false}")
    private boolean productionHardening;

    public SecurityConfig(
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver handlerExceptionResolver,
            LoginRateLimitFilter loginRateLimitFilter) {
        this.handlerExceptionResolver = handlerExceptionResolver;
        this.loginRateLimitFilter = loginRateLimitFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(
                                CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(
                                new SpaCsrfConfigurer.SpaCsrfTokenRequestHandler()))
                .addFilterAfter(
                        new SpaCsrfConfigurer.CsrfCookieFilter(),
                        BasicAuthenticationFilter.class)

                // Giris denemesi siniri, kimlik dogrulama denenmeden once
                // uygulanir; boylece sinir asildiginda parola hic
                // kontrol edilmez.
                .addFilterBefore(
                        loginRateLimitFilter,
                        UsernamePasswordAuthenticationFilter.class)

                /*
                 * Guvenlik basliklari. Spring Security varsayilan olarak
                 * X-Frame-Options ve X-Content-Type-Options gonderir;
                 * asagida CSP ve Referrer-Policy eklenir.
                 *
                 * HSTS yalnizca uretim sertlestirmesi acikken gonderilir:
                 * lokal demo HTTP uzerinden calistigi icin tarayiciyi bu
                 * host adina HTTPS'e kilitlemek gelistirmeyi bozardi.
                 */
                .headers(headers -> {
                    headers.contentSecurityPolicy(csp -> csp
                            .policyDirectives(
                                    "default-src 'self'; "
                                            + "script-src 'self'; "
                                            + "style-src 'self' 'unsafe-inline'; "
                                            + "img-src 'self' data:; "
                                            + "font-src 'self' data:; "
                                            + "connect-src 'self'; "
                                            + "frame-ancestors 'none'; "
                                            + "base-uri 'self'; "
                                            + "form-action 'self'"));

                    headers.referrerPolicy(referrer -> referrer
                            .policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));

                    if (productionHardening) {
                        headers.httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31_536_000));
                    } else {
                        headers.httpStrictTransportSecurity(
                                HstsConfig::disable);
                    }
                })

                // CORS ayarlari mevcut CorsConfig sinifindan okunur.
                .cors(cors -> {
                })

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/health",
                                "/api/auth/login")
                        .permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html")
                        .permitAll()
                        .anyRequest().authenticated())

                // Varsayilan login formu ve HTTP Basic kapatilir; giris
                // yalnizca /api/auth/login uzerinden JSON ile yapilir.
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // Yetkisiz isteklerde HTML login sayfasina yonlendirme
                // yerine projenin ApiErrorResponse formatinda JSON doner.
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((request, response, exception) -> handlerExceptionResolver
                                .resolveException(request, response, null, exception))
                        .accessDeniedHandler((request, response, exception) -> handlerExceptionResolver
                                .resolveException(request, response, null, exception)));

        return http.build();
    }
}
