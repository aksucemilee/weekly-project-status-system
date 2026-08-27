package com.kolaysoft.weeklyprojectstatus.model.enums;

/**
 * Bir kullanicinin projeye hangi sifatla atandigini belirtir.
 *
 * <p>Bu alan YETKI BELIRLEMEZ. Kapsam (sahiplik) kontrolu yalnizca
 * atamanin varligina bakar; kullanicinin ne yapabilecegini rolunun
 * yetki demeti belirler (bkz. docs/t14-authorization-matrix.md bolum 1:
 * "rol degil, yetki"). Alan raporlama ve gorunurluk amaclidir; ornegin
 * dashboard ile proje listesindeki "sorumlu proje yoneticisi" bilgisi
 * PROJE_YONETICISI sifatiyla yapilan aktif atamadan turetilir.
 *
 * <p>Onceki surumde bir de GORUNTULEYICI degeri vardi; hicbir kod yolu
 * bu degeri okumadigi icin "goruntuleyici olarak atanmis" bir kullanici
 * da rolunun tum yetkileriyle islem yapiyordu. Yanlis bir guvenlik
 * beklentisi yaratmamak icin deger kaldirilmistir.
 */
public enum AssignmentRole {

    PROJE_YONETICISI,
    EKIP_LIDERI
}
