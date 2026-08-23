package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.dto.auth.CurrentUserResponse;
import com.kolaysoft.weeklyprojectstatus.model.dto.auth.LoginRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.repository.UserRepository;
import com.kolaysoft.weeklyprojectstatus.security.AppUserPrincipal;
import com.kolaysoft.weeklyprojectstatus.security.CurrentUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            CurrentUserService currentUserService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    /**
     * Basarili girigte oturum acilir ve kullanicinin rol/yetki bilgisi
     * doner.
     *
     * Hatali giriste hangi alanin yanlis oldugu ACIKLANMAZ (On Analiz 7.1,
     * is kurali 4): kullanici bulunamadi, parola yanlis ve kullanici pasif
     * durumlarinin hepsi ayni genel mesajla yanitlanir. Boylece gecerli bir
     * e-posta adresinin sistemde kayitli olup olmadigi disari sizmaz.
     */
    @Transactional(readOnly = true)
    public CurrentUserResponse login(
            LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        Authentication authentication;

        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
        } catch (AuthenticationException exception) {
            throw new BadCredentialsException(
                    "E-posta veya parola hatalı.");
        }

        // Oturum sabitleme (session fixation) saldirisina karsi, istemcinin
        // ELINDE ZATEN bir oturum varsa kimligi yenilenir. CSRF token'i
        // cerez tabanli tutuldugu icin giris aninda cogu zaman henuz oturum
        // yoktur; changeSessionId() oturumsuz istekte hata firlattigindan
        // once varlik kontrolu yapilir. Oturum yoksa saveContext zaten
        // yenisini olusturur.
        if (httpRequest.getSession(false) != null) {
            httpRequest.changeSessionId();
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse);

        AppUserPrincipal principal =
                (AppUserPrincipal) authentication.getPrincipal();

        return toResponse(principal);
    }

    public void logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();

        new SecurityContextLogoutHandler()
                .logout(httpRequest, httpResponse, authentication);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser() {
        return toResponse(currentUserService.requireCurrentPrincipal());
    }

    private CurrentUserResponse toResponse(AppUserPrincipal principal) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new BadCredentialsException(
                        "Kullanıcı bulunamadı."));

        return new CurrentUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().getCode(),
                principal.getPermissionNames());
    }
}
