package com.kolaysoft.weeklyprojectstatus.model.dto.admin;

import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;

import java.time.LocalDateTime;

/**
 * Parola veya hash bilgisi hicbir zaman doner yanitta yer almaz.
 */
public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        RoleCode role,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
