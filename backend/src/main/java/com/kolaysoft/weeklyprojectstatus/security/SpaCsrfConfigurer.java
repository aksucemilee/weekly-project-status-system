package com.kolaysoft.weeklyprojectstatus.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.function.Supplier;

/**
 * Cerez tabanli oturum kullanildigi icin CSRF korumasi acik tutulur.
 * SPA'lar icin Spring Security'nin onerdigi iki parca burada toplanmistir:
 *
 * - {@link SpaCsrfTokenRequestHandler}: token'i istek basliginda (
 *   X-XSRF-TOKEN) duz deger olarak kabul eder; yalnizca form parametresi
 *   geldiginde BREACH korumali cozumlemeye duser.
 * - {@link CsrfCookieFilter}: token'i her istekte materyalize ederek
 *   XSRF-TOKEN cerezinin taraciyaya yazilmasini garanti eder. Aksi hâlde
 *   token tembel yuklendigi icin cerez hic olusmayabilir.
 */
public final class SpaCsrfConfigurer {

    private SpaCsrfConfigurer() {
    }

    public static class SpaCsrfTokenRequestHandler
            implements CsrfTokenRequestHandler {

        private final CsrfTokenRequestAttributeHandler plain =
                new CsrfTokenRequestAttributeHandler();

        private final CsrfTokenRequestAttributeHandler xor =
                new org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler();

        @Override
        public void handle(
                HttpServletRequest request,
                HttpServletResponse response,
                Supplier<CsrfToken> csrfToken) {
            xor.handle(request, response, csrfToken);

            // Token'i erkenden cozumleyerek cerezin yazilmasini tetikler.
            csrfToken.get();
        }

        @Override
        public String resolveCsrfTokenValue(
                HttpServletRequest request,
                CsrfToken csrfToken) {
            String headerValue = request.getHeader(csrfToken.getHeaderName());

            return StringUtils.hasText(headerValue)
                    ? plain.resolveCsrfTokenValue(request, csrfToken)
                    : xor.resolveCsrfTokenValue(request, csrfToken);
        }
    }

    public static class CsrfCookieFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain)
                throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request
                    .getAttribute(CsrfToken.class.getName());

            if (csrfToken != null) {
                csrfToken.getToken();
            }

            filterChain.doFilter(request, response);
        }
    }
}
