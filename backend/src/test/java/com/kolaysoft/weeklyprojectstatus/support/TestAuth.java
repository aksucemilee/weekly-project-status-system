package com.kolaysoft.weeklyprojectstatus.support;

import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.security.AppUserPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Testte oturum acmis kullaniciyi kurar.
 *
 * CurrentUserService kapsam kontrolunu SecurityContext'teki
 * AppUserPrincipal uzerinden yaptigi icin servis testlerinin de gercek
 * bir principal ile calismasi gerekir. Kullanici test icinde
 * olusturuldugu icin baglam da test icinde kurulur (annotation tabanli
 * yaklasim @BeforeEach'ten once calisirdi).
 */
public final class TestAuth {

    private TestAuth() {
    }

    public static void loginAs(User user) {
        AppUserPrincipal principal = new AppUserPrincipal(user);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()));
    }

    public static void logout() {
        SecurityContextHolder.clearContext();
    }
}
