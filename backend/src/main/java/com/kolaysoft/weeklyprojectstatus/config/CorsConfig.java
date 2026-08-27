package com.kolaysoft.weeklyprojectstatus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Izinli origin listesi. Onceki surumde kod icine sabit yazilmisti;
     * farkli bir adrese deploy etmek kaynak degisikligi gerektiriyordu.
     * Artik ortam degiskeninden okunur, virgulle birden fazla deger
     * verilebilir.
     *
     * Joker (*) KULLANILMAZ: allowCredentials(true) ile birlikte joker
     * origin, herhangi bir sitenin kullanicinin oturum cerezi ile istek
     * yapmasina izin verirdi.
     */
    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:5173}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS")
                // Gercekte kullanilan basliklarla sinirli tutulur; joker
                // yerine acik liste, izin verilen yuzeyi daraltir.
                .allowedHeaders(
                        "Content-Type",
                        "X-XSRF-TOKEN",
                        "Accept",
                        "Origin")
                // Oturum cerezi ve CSRF token'i cross-origin gonderilebilsin
                // diye gereklidir; kapali oldugunda tarayici cerezi hic
                // gondermez ve her istek 401 doner.
                .allowCredentials(true);
    }
}