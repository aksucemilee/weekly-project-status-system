package com.kolaysoft.weeklyprojectstatus.security;

import com.kolaysoft.weeklyprojectstatus.model.entity.Permission;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Oturum acmis kullaniciyi temsil eder. Authority'ler rol adi degil
 * {@link PermissionCode} degerleridir; bu sayede kontroller
 * hasAuthority('REPORT_CREATE') seklinde yazilir ve rol adi kodda gecmez.
 *
 * Kullanicinin efektif yetkisi: rolun yetkileri + kullaniciya dogrudan
 * verilen ek yetkiler.
 */
public class AppUserPrincipal implements UserDetails {

    private final Long userId;
    private final String email;
    private final String passwordHash;
    private final RoleCode roleCode;
    private final boolean active;
    private final Set<PermissionCode> permissions;

    public AppUserPrincipal(User user) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.roleCode = user.getRole().getCode();
        this.active = user.isActive();

        Set<PermissionCode> effectivePermissions = new LinkedHashSet<>();

        for (Permission permission : user.getRole().getPermissions()) {
            effectivePermissions.add(permission.getCode());
        }

        for (Permission permission : user.getAdditionalPermissions()) {
            effectivePermissions.add(permission.getCode());
        }

        this.permissions = Set.copyOf(effectivePermissions);
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public RoleCode getRoleCode() {
        return roleCode;
    }

    public Set<PermissionCode> getPermissions() {
        return permissions;
    }

    public boolean hasPermission(PermissionCode permission) {
        return permissions.contains(permission);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return permissions.stream()
                .map(permission -> (GrantedAuthority) new SimpleGrantedAuthority(
                        permission.name()))
                .toList();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Pasif kullanici giris yapamaz (On Analiz 7.1, is kurali 2).
     */
    @Override
    public boolean isEnabled() {
        return active;
    }

    public List<String> getPermissionNames() {
        return permissions.stream()
                .map(PermissionCode::name)
                .sorted()
                .toList();
    }
}
