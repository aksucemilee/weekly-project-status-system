# Yapay Zekâ Kullanım Özeti

**Proje:** Haftalık Proje Durum Raporlama ve CTO Takip Sistemi
**Hazırlayan:** Cemile Aksu
**Son güncelleme:** 26.08.2026

Bu doküman, staj yönetmeliği bölüm 1.4 ve bölüm 10.1'in ("AI kullanım özeti: kullanıldıysa nerede, ne amaçla, nasıl doğrulandı") beklediği açıklamayı içerir.

---

## 1. Temel ilke

Yönetmelik bölüm 1.4 şunu söylüyor:

> "Yapay zekâyı özellikle öğrenme amacıyla kullanmanız önerilir. Kavram açıklama, hata mesajını anlama, örnek üretme, test senaryosu çıkarma, dokümantasyon taslağı ve kod gözden geçirme gibi alanlarda destek alabilirsiniz; ancak **üretilen sonucu anlamadan doğrudan kullanmamalı ve doğrulamalısınız.**"

Bu projede benimsenen kural: **AI çıktısı hiçbir zaman doğrulanmadan projeye alınmadı.** Her çıktı en az bir somut kontrolden geçirildi — derleme, uygulamayı çalıştırma, Swagger/tarayıcı üzerinden deneme veya dokümanla karşılaştırma.

---

## 2. Nerede ve ne amaçla kullanıldı

Aşağıdaki tablo, yönetmeliğin bölüm 1.4'te saydığı kullanım alanlarını içeren ve proje sürecinde yapay zekâdan destek alınan somut noktaları göstermektedir:

| Alan | Ne için kullanıldı | Somut örnek | Çıktı nasıl doğrulandı |
| --- | --- | --- | --- |
| Kavram açıklama | Spring Security filtre zinciri ve JPA Specification mantığı | Çoklu filtreleme parametrelerinin CriteriaBuilder ile nasıl birleştirileceğinin teorik mantığı soruldu. | Gelen açıklama üzerinden basit bir Specification sınıfı yazılıp projedeki filtrelerin doğru çalıştığı doğrulandı. |
| Hata mesajını anlama | Hibernate ddl-auto=update sonrası enum hataları ve CORS problemleri | Projeye yeni bir enum değeri eklendiğinde veritabanının neden başlatılamadığı araştırıldı. | Önerilen çözüm (temiz veritabanı kurulumu) lokal ortamda denendi ve hatanın kaybolduğu görüldü. |
| Örnek üretme | React Router v6 özelinde kapsam kontrolü (Protected Route) yapısı | Rol bazlı erişim kontrolü için frontend tarafında nasıl bir HOC (Higher-Order Component) veya wrapper kullanılabileceği örneklendirildi. | Kod projeye uyarlandı, tarayıcıda adres çubuğuna yetkisiz link yazılarak yönlendirmenin çalıştığı test edildi. |
| Test senaryosu çıkarma | Negatif API senaryoları ve yetkilendirme (RBAC) sınırlarının belirlenmesi | CTO, Admin ve Proje Yöneticisi arasındaki çakışmaları (Örn: CTO'nun rapor düzenlemeye çalışması) kapsayan test senaryoları türetildi. | Senaryolar Swagger üzerinden farklı oturum çerezleri kullanılarak elle çalıştırıldı ve sonuçlar `test-raporu.md`'ye işlendi. |
| Dokümantasyon taslağı | README, Teknik Karar Notu ve Staj Günlüğü formatlarının düzenlenmesi | Ham mühendislik notları, resmi staj defteri diline (edilgen yapı, profesyonel üslup) çevrilmesi için promptlandı. | Gelen metinler satır satır okunarak koddaki mimari ile örtüşmeyen ifadeler silindi veya düzeltildi. |

### 2.1 Teslim öncesi denetim (26.08.2026)

Bu satır repository üzerinden doğrulanabilir olduğu için önceden doldurulmuştur.

| Konu | İçerik |
| --- | --- |
| **Ne için** | Teslim öncesi bağımsız bir denetim: repository'nin staj yönetmeliği, Ön Analiz ve Teknik Karar Notu ile tutarlılığının kontrol edilmesi |
| **Kapsam** | Yönetmelik gereksinim matrisi, Ön Analiz ↔ kod karşılaştırması, Teknik Karar ↔ kod karşılaştırması, Git geçmişi denetimi, kod kalitesi ve test kapsamı değerlendirmesi |
| **Nasıl doğrulandı** | Denetimin bulguları varsayıma değil çalıştırılmış komut çıktısına dayandırıldı: `mvnw -DskipTests compile`, `mvnw test`, `npm run build`, `npm run lint`, `git log`, `git status`. Sonuçlar [`test-raporu.md`](test-raporu.md) bölüm 2'de kayıtlıdır |
| **Ne bulundu** | README'nin son bölümlerinin T14/T15 sonrası güncellenmediği ve dokümanın kendi üst bölümleriyle çeliştiği; iki dokümanın repository'de bulunmayan test artefaktlarına atıf yaptığı; `npm run lint`'in 10 hata verdiği; konsolide test raporunun ve bu dokümanın eksik olduğu |
| **Ne yapıldı** | Bulunan dokümantasyon tutarsızlıkları düzeltildi, test raporu güncellendi. Başlangıçta düşük öncelikli bırakılan Lint bulgusu (H7), final teslim öncesi düzeltilerek 0 hata durumuna getirilmiş ve kapatılmıştır |
| **Kod değişikliği** | Bu denetim kapsamında **uygulama kodu değiştirilmedi**; yalnızca dokümantasyon güncellendi. Değişikliklerin tamamı `feature/final-delivery-docs` dalındaki commit'lerden izlenebilir |

### 2.2 Final MVP kapsam denetimi ve kontrollü tamamlama (26.08.2026)

Bu satır da repository üzerinden doğrulanabilir olduğu için önceden doldurulmuştur.

| Konu | İçerik |
| --- | --- |
| **Ne için** | Staj yönetmeliği, Ön Analiz ve kabul kriterleri ile repository'nin karşılaştırılması; MVP kapsamında olduğu hâlde eksik kalan özelliklerin tespit edilip kontrollü şekilde tamamlanması |
| **Kapsam** | Üç kaynak dokümanın (yönetmelik, Ön Analiz, Teknik Karar Notu) kod ile madde madde karşılaştırılması, kullanılmayan kodun aranması, yetki/validasyon/hata yönetiminin gözden geçirilmesi, eksik özelliklerin uygulanması ve dokümanların gerçekle hizalanması |
| **Nasıl doğrulandı** | Bulgular varsayıma değil çalıştırılmış komut ve gerçek HTTP isteklerine dayandırıldı. Kullanılmayan kod iddiaları `grep` ile doğrulandı (tahminle dosya silinmedi). Eklenen endpointler backend + PostgreSQL çalışır durumdayken curl ile, oturum çerezi ve CSRF token'ı kullanılarak test edildi; sonuçlar [`test-raporu.md`](test-raporu.md) bölüm 10'da kayıtlıdır |
| **Ne bulundu** | (1) Rapor ve proje güncelleme endpointlerinin MVP'de zorunlu olduğu — yönetmelik 5.4, Ön Analiz 5 ve 7.4. (2) Marka logosunun tüm rollerde `/dashboard`'a gitmesi nedeniyle üç rolün erişim reddi ekranına düşmesi. (3) Admin'de iş kalemi sekmesinin sürekli hata vermesi. (4) `BackendStatus` bileşeninin hiç kullanılmaması. (5) **H8:** enum'a yeni değer eklendiğinde uygulamanın mevcut veritabanında açılmaması |
| **Ne yapıldı** | Eksik özellikler mevcut mimariye (Controller → Service → Repository → DTO) uyularak eklendi. Bulunan kusurlar düzeltildi, kullanılmayan kod temizlendi. Final teslim öncesi lint uyarıları da Context/Provider ayrımıyla tamamen çözüldü ve dokümanlar güncellendi |
| **Neyin yapılmadığı** | Silme endpointleri (Ön Analiz 12.3 MVP dışı sayıyor), sorumlu filtresi ve frontend otomatik test altyapısı bilinçli olarak kapsam dışı bırakıldı; gerekçeleriyle birlikte kayıtlıdır. `npm run lint` hataları ise teslim öncesinde çözüldüğü için artık "yapılmayanlar" arasında değildir |
| **Önemli not** | **H8 yalnızca uygulamayı gerçekten çalıştırarak bulunabildi.** Derleme ve mevcut test paketi bu hatayı yakalamadı. Bu, R1'in (otomatik test kapsamı yok) neden en yüksek risk olduğunun somut kanıtıdır |

---

## 3. AI'nın kullanılmadığı yerler

Bu ayrımın yazılması, kullanım alanlarının yazılması kadar önemlidir.

- **Teknik kararlar.** Ana geliştirme yönü, dil/framework seçimi, veritabanı seçimi, katmanlı mimari ve kimlik doğrulama yöntemi (oturum vs. JWT) kararları Teknik Karar Notu ve [`t14-authorization-matrix.md`](t14-authorization-matrix.md) bölüm 5'te gerekçeleriyle birlikte kendi kararım olarak yazılmıştır.
- **Kapsam kararları.** MVP sınırı, hangi özelliğin kapsam dışı bırakılacağı ve Ön Analiz'deki açık soruların cevapları proje gereksinimlerine göre belirlenmiştir.
- **Test sonuçları.** Hiçbir test sonucu üretilmemiş, yalnızca gerçekten çalıştırılan senaryolar kaydedilmiştir. Repository'de bulunmayan bir test artefaktına atıf yapılmamasına özellikle dikkat edilmiştir (bkz. `bbbf38a`).

---

## 4. Ne öğrendim

- **AI'nın Hızlandırdığı ve Yanılttığı Alanlar:** Boilerplate (tekrar eden) kod üretiminde, DTO dönüşümlerinde ve React bileşenlerinin taslağını oluşturmada yapay zekâ süreci ciddi oranda hızlandırdı. Ancak karmaşık iş kurallarının (örneğin projedeki yetki sınırlarının ISO hafta mantığıyla örtüşmesi) kurgulanmasında AI'nın bağlamı kaybettiği ve projeye uygun olmayan varsayımlar yaptığı görüldü.
- **Doğrulama ve Kontrol Alışkanlığı:** Üretilen hiçbir kod, ne yaptığı tam olarak anlaşılmadan projeye kopyalanmadı. AI'dan gelen kod parçacıkları önce bağımsız olarak test edildi, Spring Boot'un logları incelendi ve özellikle güvenlik tarafındaki (`@PreAuthorize`) çıktıların Swagger üzerinden manuel yetki testleri bizzat yapılarak onaylandı.
- **Problemi Önden Tanımlamanın Önemi:** AI'a "Bana bir filtreleme yap" demek yerine; "JPA Specification kullanarak, X ve Y parametrelerini opsiyonel alan, dinamik bir WHERE koşulu nasıl kurgulanır?" şeklinde spesifik ve sınırları çizilmiş komutlar (prompt engineering) vermenin, halüsinasyonları ve hatalı mimari önerilerini engellediği tecrübe edildi.

---

## 5. Özet

Yapay zekâ bu projede **öğrenmeyi hızlandıran ve çıktıyı denetleyen bir araç** olarak kullanılmış; karar verici olarak kullanılmamıştır. Teknik kararlar, kapsam kararları ve test sonuçları projenin kendi dokümanlarında gerekçeleriyle kayıtlıdır. Üretilen hiçbir çıktı, çalıştırılarak veya kodla karşılaştırılarak doğrulanmadan projeye alınmamıştır.
