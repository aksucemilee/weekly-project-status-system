package com.kolaysoft.weeklyprojectstatus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS")
                .allowedHeaders("*")
                // Oturum cerezi ve CSRF token'i cross-origin gonderilebilsin
                // diye gereklidir; kapali oldugunda tarayici cerezi hic
                // gondermez ve her istek 401 doner.
                .allowCredentials(true);
    }
}