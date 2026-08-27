package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.dto.workitem.WorkItemCreateRequest;
import com.kolaysoft.weeklyprojectstatus.model.enums.WorkItemStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Is kalemi tarih/durum kurallari (bkz. test-raporu.md, bulgu H4).
 *
 * Kural saf mantiktir; servisin diger bagimliliklari kullanilmadigi icin
 * veritabani veya Spring baglamı gerekmez.
 */
class WorkItemValidationTest {

    private final WorkItemService service = new WorkItemService(null, null);

    private void validate(
            WorkItemStatus status,
            LocalDate plannedDate,
            LocalDate completedDate) {
        WorkItemCreateRequest request = new WorkItemCreateRequest();
        request.setStatus(status);
        request.setPlannedDate(plannedDate);
        request.setCompletedDate(completedDate);

        ReflectionTestUtils.invokeMethod(
                service,
                "validateDatesAndStatus",
                status,
                plannedDate,
                completedDate);
    }

    @Test
    @DisplayName("Tamamlanma tarihi girildiginde durum COMPLETED olmali")
    void completedDateRequiresCompletedStatus() {
        assertThatThrownBy(() -> validate(
                WorkItemStatus.IN_PROGRESS,
                LocalDate.of(2026, 8, 24),
                LocalDate.of(2026, 8, 26)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tamamlandı olmalıdır");
    }

    @Test
    @DisplayName("Durum COMPLETED ise tamamlanma tarihi zorunlu")
    void completedStatusRequiresCompletedDate() {
        assertThatThrownBy(() -> validate(
                WorkItemStatus.COMPLETED,
                LocalDate.of(2026, 8, 24),
                null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("tamamlanma tarihi zorunludur");
    }

    @Test
    @DisplayName("Tamamlanma tarihi planlanan tarihten once olamaz")
    void completedDateCannotPrecedePlannedDate() {
        assertThatThrownBy(() -> validate(
                WorkItemStatus.COMPLETED,
                LocalDate.of(2026, 8, 26),
                LocalDate.of(2026, 8, 24)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("planlanan tarihten önce olamaz");
    }

    @Test
    @DisplayName("Gecerli tarih/durum bileskesi kabul edilir")
    void validCombinationsAreAccepted() {
        assertThatCode(() -> validate(
                WorkItemStatus.COMPLETED,
                LocalDate.of(2026, 8, 24),
                LocalDate.of(2026, 8, 26)))
                .doesNotThrowAnyException();

        assertThatCode(() -> validate(
                WorkItemStatus.IN_PROGRESS,
                LocalDate.of(2026, 8, 24),
                null))
                .doesNotThrowAnyException();
    }
}
