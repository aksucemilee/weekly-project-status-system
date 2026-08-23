package com.kolaysoft.weeklyprojectstatus.model.dto.auth;

import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;

import java.util.List;

/**
 * Frontend'in ekran ve aksiyon gorunurlugunu kurmasi icin gereken bilgi.
 * Yetki listesi rol adindan bagimsiz olarak gonderilir; arayuz de backend
 * ile ayni yetki kodlarina bakar.
 */
public record CurrentUserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        RoleCode role,
        List<String> permissions) {
}
