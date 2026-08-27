package com.kolaysoft.weeklyprojectstatus.model.enums;

/**
 * Haftalik raporun o hafta icin CALISMA durumu.
 *
 * On Analiz bolum 10.3 bu alan icin acikca uyarmisti: "Genel durum
 * alanindaki nihai secenekler, Testte/Gecikti/Riskli gibi degerlerin is
 * kalemi durumu, takvim durumu ve risk seviyesi alanlariyla CAKISMAMASI
 * icin acik sorularin cevaplarina gore netlestirilecektir." (acik soru 7)
 *
 * Karar: bu alan yalnizca calisma asamasini ifade eder. Onceki surumde
 * bulunan DELAYED ve AT_RISK degerleri kaldirilmistir, cunku:
 *   - gecikme  ayri bir eksendir -> ScheduleStatus (ON_TRACK / DELAYED)
 *   - risk     ayri bir eksendir -> RiskLevel (LOW / MEDIUM / HIGH)
 *
 * Bu sayede uc alan birbirine dik olur ve "generalStatus=DELAYED ama
 * scheduleStatus=ON_TRACK" gibi mantiksal olarak celiskili kayitlar
 * olusturulamaz.
 */
public enum GeneralStatus {
    PLANNED,
    IN_PROGRESS,
    IN_TEST,
    COMPLETED,
    BLOCKED
}
