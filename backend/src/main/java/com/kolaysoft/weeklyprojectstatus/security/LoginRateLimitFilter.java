package com.kolaysoft.weeklyprojectstatus.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Giris denemelerine sinir koyar (brute-force korumasi).
 *
 * <p><b>Neden gerekli.</b> Parolalar BCrypt ile hash'lenir; bu, veritabani
 * ele gecirilirse offline saldiriyi yavaslatir. Ancak calisan sisteme
 * karsi yapilan ONLINE denemeyi engellemez: saniyede onlarca istekle
 * zayif parolalar denenebilir. Bu filtre o yolu kapatir.
 *
 * <p><b>Sayac anahtari: IP adresi.</b> E-posta bazli sayac, saldirganin
 * baskasinin hesabini kasten kilitlemesine (hesap kilitleme saldirisi)
 * izin verirdi. Ayrica giris istegi JSON govdesiyle geldigi icin
 * e-postayi filtrede okumak istek akisini tuketir ve sarmalayici
 * gerektirir; bu karmasikligin karsiligi yoktur. IP bazli sayac ortak
 * NAT arkasinda birden fazla kullaniciyi ayni kovaya koyar, ancak
 * secilen sinir (varsayilan 5/15dk) normal kullanimi engellemeyecek
 * kadar genistir.
 *
 * <p><b>Sinir asildiginda</b> 429 doner ve yanit govdesi projenin
 * {@code ApiErrorResponse} formatiyla ayni kalir; bu filtre Spring
 * Security zincirinden once calistigi icin govde burada uretilir.
 *
 * <p>Sayaclar bellekte tutulur. Tek instance uzerinde calisan bu proje
 * icin yeterlidir; yatay olcekleme durumunda paylasimli bir depo
 * (Redis vb.) gerekir.
 */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(LoginRateLimitFilter.class);

    private static final String LOGIN_PATH = "/api/auth/login";

    /** Anahtar basina bellekte tutulan kova sayisi icin ust sinir. */
    private static final int MAX_TRACKED_KEYS = 10_000;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Value("${security.login.max-attempts:5}")
    private int maxAttempts;

    @Value("${security.login.window-minutes:15}")
    private int windowMinutes;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !(HttpMethod.POST.matches(request.getMethod())
                && LOGIN_PATH.equals(request.getRequestURI()));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String key = rateLimitKey(request);

        if (buckets.size() > MAX_TRACKED_KEYS) {
            // Bellegin sinirsiz buyumesini engeller; sinir asildiginda
            // sayaclar sifirlanir. Basit ama bu olcek icin yeterlidir.
            buckets.clear();
        }

        Bucket bucket = buckets.computeIfAbsent(key, ignored -> newBucket());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Parola veya e-posta loglanmaz; yalnizca sinirin asildigi bilgisi.
        log.warn("Giriş denemesi sınırı aşıldı: {}", key);

        writeTooManyRequests(request, response);
    }

    private Bucket newBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(maxAttempts)
                        .refillIntervally(
                                maxAttempts,
                                Duration.ofMinutes(windowMinutes))
                        .build())
                .build();
    }

    private String rateLimitKey(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    private void writeTooManyRequests(
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");

        String body = """
                {"timestamp":"%s","status":429,"error":"Too Many Requests",\
                "message":"Çok fazla giriş denemesi yapıldı. Lütfen bir süre sonra tekrar deneyin.",\
                "path":"%s"}"""
                .formatted(java.time.LocalDateTime.now(), request.getRequestURI());

        response.getWriter().write(body);
    }
}
