package com.kolaysoft.weeklyprojectstatus.security;

import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectAssignmentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Kapsam (sahiplik) kontrolunun tek merkezi.
 *
 * Yetki kontrolu "bu kullanici bu turde islem yapabilir mi" sorusunu
 * yanitlar ve controller'larda @PreAuthorize ile uygulanir. Bu servis ise
 * ikinci ekseni yanitlar: "bu kullanici BU KAYIT uzerinde islem yapabilir
 * mi". Ikisi birlikte calisir; yetki kontrolunu gecen bir istek kapsam
 * kontrolunde reddedilebilir.
 *
 * Tum projelere erisebilen roller (CTO, Admin) icin kapsam sinirsizdir;
 * bu durum {@link #getAllowedProjectIds()} icinde bos Optional ile
 * temsil edilir.
 */
@Service
public class CurrentUserService {

    private final ProjectAssignmentRepository projectAssignmentRepository;

    public CurrentUserService(
            ProjectAssignmentRepository projectAssignmentRepository) {
        this.projectAssignmentRepository = projectAssignmentRepository;
    }

    public Optional<AppUserPrincipal> findCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            return Optional.empty();
        }

        return Optional.of(principal);
    }

    public AppUserPrincipal requireCurrentPrincipal() {
        return findCurrentPrincipal()
                .orElseThrow(() -> new AccessDeniedException(
                        "Bu işlem için oturum açmanız gerekir."));
    }

    /**
     * Kullanicinin erisebildigi proje id kumesi.
     *
     * @return bos Optional ise kullanici tum projelere erisebilir
     *         (kapsam kontrolu uygulanmaz); dolu Optional ise yalnizca
     *         listedeki projelere erisebilir.
     */
    @Transactional(readOnly = true)
    public Optional<List<Long>> getAllowedProjectIds() {
        AppUserPrincipal principal = requireCurrentPrincipal();

        if (hasUnrestrictedProjectScope(principal)) {
            return Optional.empty();
        }

        return Optional.of(projectAssignmentRepository
                .findAllowedProjectIds(principal.getUserId()));
    }

    /**
     * Kullanicinin belirtilen proje uzerinde islem yapip yapamayacagini
     * kontrol eder; yapamiyorsa AccessDeniedException firlatir (403).
     */
    @Transactional(readOnly = true)
    public void checkProjectAccess(Long projectId) {
        AppUserPrincipal principal = requireCurrentPrincipal();

        if (hasUnrestrictedProjectScope(principal)) {
            return;
        }

        boolean assigned = projectAssignmentRepository
                .existsByProject_IdAndUser_IdAndActiveTrue(
                        projectId,
                        principal.getUserId());

        if (!assigned) {
            throw new AccessDeniedException(
                    "Bu proje üzerinde işlem yapma yetkiniz bulunmuyor.");
        }
    }

    /**
     * Tum projelere erisim, atamaya degil yetkiye baglidir: portfoyun
     * tamamini goren CTO (DASHBOARD_VIEW) ve sistemi yoneten Admin
     * (ASSIGNMENT_MANAGE) kapsam kisitina tabi degildir.
     */
    private boolean hasUnrestrictedProjectScope(AppUserPrincipal principal) {
        return principal.hasPermission(PermissionCode.DASHBOARD_VIEW)
                || principal.hasPermission(PermissionCode.ASSIGNMENT_MANAGE);
    }
}
