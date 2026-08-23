package com.kolaysoft.weeklyprojectstatus.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger log = LoggerFactory
                        .getLogger(GlobalExceptionHandler.class);

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleResourceNotFound(
                        ResourceNotFoundException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.NOT_FOUND,
                                exception.getMessage(),
                                request.getRequestURI());
        }

        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ApiErrorResponse> handleDuplicateResource(
                        DuplicateResourceException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.CONFLICT,
                                exception.getMessage(),
                                request.getRequestURI());
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
                        IllegalArgumentException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                exception.getMessage(),
                                request.getRequestURI());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidationException(
                        MethodArgumentNotValidException exception,
                        HttpServletRequest request) {
                String message = exception.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(error -> error.getDefaultMessage())
                                .findFirst()
                                .orElse("Gönderilen bilgiler geçersizdir.");

                return buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                message,
                                request.getRequestURI());
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiErrorResponse> handleHttpMessageNotReadable(
                        HttpMessageNotReadableException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                "Gönderilen JSON verisi geçersizdir. Enum değerlerini ve tarih biçimini kontrol edin.",
                                request.getRequestURI());
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiErrorResponse> handleMethodArgumentTypeMismatch(
                        MethodArgumentTypeMismatchException exception,
                        HttpServletRequest request) {
                String message = "'" + exception.getName()
                                + "' parametresi için gönderilen değer geçersizdir.";

                return buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                message,
                                request.getRequestURI());
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
                        DataIntegrityViolationException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.CONFLICT,
                                "İstek mevcut veriyle çakıştığı için tamamlanamadı.",
                                request.getRequestURI());
        }

        @ExceptionHandler(NoHandlerFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleNoHandlerFound(
                        NoHandlerFoundException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.NOT_FOUND,
                                "İstenen kaynak bulunamadı.",
                                request.getRequestURI());
        }

        @ExceptionHandler(NoResourceFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleNoResourceFound(
                        NoResourceFoundException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.NOT_FOUND,
                                "İstenen kaynak bulunamadı.",
                                request.getRequestURI());
        }

        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(
                        HttpRequestMethodNotSupportedException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.METHOD_NOT_ALLOWED,
                                "Bu istek için '" + exception.getMethod()
                                                + "' HTTP metodu desteklenmiyor.",
                                request.getRequestURI());
        }

        /*
         * Asagidaki iki handler, alttaki genel Exception fallback'inin
         * Spring Security'nin yetki hatalarini 500'e cevirmesini engeller.
         * @PreAuthorize veya kapsam kontrolu tarafindan firlatilan hata
         * controller cagrisi icinde olustugu icin filtre zincirindeki
         * ExceptionTranslationFilter'a ulasmadan buraya duser.
         */

        /**
         * Basarisiz giris. Mesaj AuthService tarafindan uretilir ve hangi
         * alanin yanlis oldugunu ACIKLAMAZ (On Analiz 7.1, is kurali 4).
         */
        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiErrorResponse> handleBadCredentials(
                        BadCredentialsException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.UNAUTHORIZED,
                                exception.getMessage(),
                                request.getRequestURI());
        }

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiErrorResponse> handleAuthentication(
                        AuthenticationException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.UNAUTHORIZED,
                                "Bu işlem için oturum açmanız gerekir.",
                                request.getRequestURI());
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiErrorResponse> handleAccessDenied(
                        AccessDeniedException exception,
                        HttpServletRequest request) {
                return buildErrorResponse(
                                HttpStatus.FORBIDDEN,
                                exception.getMessage() == null
                                                || exception.getMessage().isBlank()
                                                                ? "Bu işlem için yetkiniz bulunmuyor."
                                                                : exception.getMessage(),
                                request.getRequestURI());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
                        Exception exception,
                        HttpServletRequest request) {
                // Istemciye teknik detay verilmez, ancak sunucu tarafinda
                // loglanmazsa beklenmeyen hatalar tamamen gorunmez kalir.
                log.error("Beklenmeyen hata: {} {}",
                                request.getMethod(),
                                request.getRequestURI(),
                                exception);

                return buildErrorResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
                                request.getRequestURI());
        }

        private ResponseEntity<ApiErrorResponse> buildErrorResponse(
                        HttpStatus status,
                        String message,
                        String path) {
                ApiErrorResponse response = new ApiErrorResponse(
                                LocalDateTime.now(),
                                status.value(),
                                status.getReasonPhrase(),
                                message,
                                path);

                return ResponseEntity
                                .status(status)
                                .body(response);
        }
}