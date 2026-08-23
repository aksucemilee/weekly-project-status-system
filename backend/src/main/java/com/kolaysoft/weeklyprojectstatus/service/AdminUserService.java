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

    public AdminUserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
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

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(getRole(request.getRole()));
        user.setActive(request.getActive());

        return toResponse(userRepository.save(user));
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
