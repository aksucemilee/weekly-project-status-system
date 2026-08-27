package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.exception.DuplicateResourceException;
import com.kolaysoft.weeklyprojectstatus.exception.ResourceNotFoundException;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.UserCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.UserResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.admin.UserUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.Role;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import com.kolaysoft.weeklyprojectstatus.repository.RoleRepository;
import com.kolaysoft.weeklyprojectstatus.repository.UserRepository;
import com.kolaysoft.weeklyprojectstatus.security.CurrentUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;

    public AdminUserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
    }

    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(getRole(request.getRole()));
        user.setActive(request.getActive() == null || request.getActive());

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByEmailAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Kullanıcı bulunamadı: " + userId));

        checkSelfLockout(user, request);
        checkLastActiveAdmin(user, request);

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(getRole(request.getRole()));
        user.setActive(request.getActive());

        return toResponse(userRepository.save(user));
    }

    /**
     * Admin kendi erisimini kapatamaz.
     *
     * Aksi halde tek hamlede kendini sistem disinda birakabilir ve
     * (baska bir admin yoksa) geri donusu yalnizca veritabanina elle
     * mudahale ile mumkun olur.
     */
    private void checkSelfLockout(User user, UserUpdateRequest request) {
        boolean editingSelf = currentUserService.findCurrentPrincipal()
                .map(principal -> principal.getUserId().equals(user.getId()))
                .orElse(false);

        if (!editingSelf) {
            return;
        }

        if (Boolean.FALSE.equals(request.getActive())) {
            throw new IllegalArgumentException(
                    "Kendi hesabınızı pasife alamazsınız.");
        }

        if (request.getRole() != user.getRole().getCode()) {
            throw new IllegalArgumentException(
                    "Kendi rolünüzü değiştiremezsiniz.");
        }
    }

    /**
     * Sistemde en az bir aktif admin kalmalidir.
     *
     * <p><b>Not:</b> Bu kontrol mevcut API yolundan pratikte
     * ULASILMAZDIR: bir admin'i son aktif admin yapan tek senaryo onun
     * kendisi olmasidir, o durumu da {@link #checkSelfLockout} daha once
     * engeller. Baska bir aktif admin islem yapiyorsa sayac zaten
     * ikiden buyuktur.
     *
     * <p>Yine de korunur: ikincil bir emniyet agi olarak, dogrudan servis
     * cagrisi veya ileride eklenecek bir toplu islem endpoint'i bu
     * degismezi bozmasin diye.
     */
    private void checkLastActiveAdmin(User user, UserUpdateRequest request) {
        boolean wasActiveAdmin = user.isActive()
                && user.getRole().getCode() == RoleCode.ADMIN;

        if (!wasActiveAdmin) {
            return;
        }

        boolean staysActiveAdmin = Boolean.TRUE.equals(request.getActive())
                && request.getRole() == RoleCode.ADMIN;

        if (staysActiveAdmin) {
            return;
        }

        long activeAdmins = userRepository
                .countByRole_CodeAndActiveTrue(RoleCode.ADMIN);

        if (activeAdmins <= 1) {
            throw new IllegalArgumentException(
                    "Sistemde en az bir aktif admin kullanıcı bulunmalıdır.");
        }
    }

    private Role getRole(RoleCode code) {
        return roleRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rol bulunamadı: " + code));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().getCode(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
