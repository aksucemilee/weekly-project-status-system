package com.kolaysoft.weeklyprojectstatus.model.enums;

/**
 * Projenin YASAM DONGUSU durumu; admin tarafindan yonetilir.
 *
 * Bu alan, haftalik raporun {@link GeneralStatus} alaniyla ayni seyi
 * ifade ETMEZ. Onceki surumde ikisi de PLANNED/IN_PROGRESS/COMPLETED/
 * BLOCKED degerlerini tasiyordu ve ayni proje icin farkli degerler
 * gosterebiliyordu (orn. proje IN_PROGRESS iken son raporu DELAYED).
 * Hangisinin dogru oldugu belirsizdi.
 *
 * Karar (On Analiz bolum 4.1'in tarifine uygun olarak: "Baslamadi,
 * Aktif, Askida veya Kapandi"):
 *   - Proje seviyesi  -> bu enum: proje hangi asamada
 *   - Hafta seviyesi  -> GeneralStatus: o hafta ne yapiliyor
 *
 * Dashboard'in haftalik gostergeleri (durum, gecikme, risk) rapordan
 * okunur; bu alan yalnizca projenin portfoydeki yerini belirtir.
 */
public enum ProjectStatus {
    PLANNED,
    ACTIVE,
    ON_HOLD,
    CLOSED
}
