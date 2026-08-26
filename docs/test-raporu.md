# Test Raporu

**Proje:** Haftalık Proje Durum Raporlama ve CTO Takip Sistemi
**Hazırlayan:** Cemile Aksu
**Son güncelleme:** 26.08.2026

Bu doküman, staj yönetmeliği bölüm 1.1'in ("Test kanıtı: senaryolar, hata kayıtları, düzeltme sonrası tekrar test ve kalan riskler") ve bölüm 9'un beklediği test kanıtını tek dosyada toplar. T14 yetkilendirme senaryolarının ayrıntılı listesi ayrıca [`t14-authorization-matrix.md`](t14-authorization-matrix.md) bölüm 10 ve 12'de bulunur.

---

## 1. Kapsam ve yöntem

| Konu | Durum |
| --- | --- |
| Test yaklaşımı | Ağırlıklı olarak **manuel** test: tarayıcı üzerinden kullanıcı akışları, Swagger/curl üzerinden API senaryoları |
| Otomatik test | **Sınırlı.** Backend'de yalnızca uygulama bağlamının yüklendiğini doğrulayan tek bir test bulunur; frontend'de otomatik test altyapısı yoktur. Ayrıntı için bölüm 7 |
| Test verisi | `DemoDataInitializer` ile üretilen demo verisi (`SEED_DEMO_DATA=true`) ve elle girilen kayıtlar |
| Roller | Dört demo kullanıcısı ile ayrı oturumlar: `pm@`, `cto@`, `admin@`, `lider@demo.local` |

**Bu raporda "manuel" ile "otomatik" kanıt bilinçli olarak ayrılmıştır.** Bölüm 2'deki sonuçlar komut çıktısına dayanır ve tekrar üretilebilir; bölüm 3-5'teki senaryolar geliştirme sırasında elle çalıştırılmıştır ve repository'de saklanan bir artefaktı yoktur.

## 2. Otomatik doğrulama (komut çıktısıyla)

Aşağıdaki komutlar 26.08.2026 tarihinde temiz working tree üzerinde çalıştırılmıştır.

| # | Kontrol | Komut | Sonuç |
| --- | --- | --- | --- |
| A1 | Backend derleme | `mvnw -DskipTests compile` | ✅ `BUILD SUCCESS` |
| A2 | Backend test | `mvnw test` | ✅ `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0` |
| A3 | Veritabanı bağlantısı | A2 çalışırken Hibernate logu | ✅ PostgreSQL 18.1'e bağlandı, şema `weekly_project_status/public` |
| A4 | Frontend production build | `npm run build` | ✅ `built in 912ms`, `dist/assets/index-*.js 722.22 kB` |
| A5 | Frontend lint | `npm run lint` | ❌ **10 error** — bkz. Bulgu H7 |

**A2 hakkında dürüst not:** Bu komutun `BUILD SUCCESS` dönmesi sistemin test edildiği anlamına gelmez. Çalışan tek test `WeeklyProjectStatusApplicationTests.contextLoads()` olup yalnızca Spring bağlamının hatasız yüklendiğini doğrular. Tek bir iş kuralı, tek bir yetki kontrolü veya tek bir validasyon bu testle doğrulanmamaktadır.

## 3. MVP fonksiyonel senaryoları (T08 / 15. gün)

Backend, frontend ve PostgreSQL birlikte çalıştırılarak tarayıcı ve Swagger üzerinden manuel olarak doğrulanmıştır.

| # | Senaryo | Beklenen | Sonuç |
| --- | --- | --- | --- |
| F1 | Backend ve PostgreSQL bağlantısı (`GET /api/health`) | `status: UP` döner | ✅ |
| F2 | Proje oluşturma | Proje kaydedilir, listede görünür | ✅ |
| F3 | Projeleri listeleme | Kullanıcının kapsamındaki projeler listelenir | ✅ |
| F4 | Haftalık rapor oluşturma | Rapor kaydedilir, detayı gösterilir | ✅ |
| F5 | Raporun PostgreSQL'e yazılması | Kayıt `weekly_reports` tablosunda görünür | ✅ |
| F6 | Haftalık raporları görüntüleme | Proje raporları listelenir | ✅ |
| F7 | Rapora iş kalemi ekleme | İş kalemi rapor altında listelenir | ✅ |
| F8 | İş kalemi güncelleme ve silme | Değişiklik yansır / kayıt kaldırılır | ✅ |
| F9 | Risk / engel kaydı oluşturma | Kayıt rapor altında görünür | ✅ |
| F10 | Risk / engel güncelleme ve silme | Değişiklik yansır / kayıt kaldırılır | ✅ |
| F11 | CTO dashboard görüntüleme | Özet sayaçlar ve proje tablosu gelir | ✅ |
| F12 | Dashboard filtreleri | Seçilen filtreye uyan projeler listelenir | ✅ |
| F13 | Rapor detayında iş kalemi ve risk görüntüleme | Alt listeler dolu gelir | ✅ |

## 4. Negatif ve validasyon senaryoları

| # | Senaryo | Beklenen | Sonuç |
| --- | --- | --- | --- |
| N1 | İlerleme değeri `100`'den büyük (`120`) | `400`, alan hatası mesajı | ✅ |
| N2 | İlerleme değeri `0`'dan küçük (`-5`) | `400`, alan hatası mesajı | ✅ |
| N3 | Zorunlu alanların boş bırakılması | `400`, ilgili alanın hata mesajı | ✅ |
| N4 | Var olmayan proje / kayıt kimliği | `404`, açıklayıcı mesaj | ✅ |
| N5 | Geçersiz tarih değeri | `400` | ✅ |
| N6 | Geçersiz JSON gövdesi | `400`, teknik detay sızdırmayan mesaj | ✅ (bkz. Bulgu H1) |
| N7 | Desteklenmeyen HTTP metodu | `405` | ✅ |
| N8 | Aynı proje + aynı hafta için ikinci rapor | `409 Conflict` | ✅ |
| N9 | Geçersiz `sort` alanı / yönü | `400`, kullanılabilir alanların listesi | ✅ |
| N10 | İş kalemi: tamamlanma tarihi planlanan tarihten önce | `400` | ✅ (bkz. Bulgu H4) |
| N11 | İş kalemi: durum `COMPLETED` ama tamamlanma tarihi boş | `400` | ✅ |
| N12 | Filtreye uyan kayıt yok | Boş sonuç mesajı, hata değil | ✅ |
| N13 | API hata mesajının arayüzde gösterilmesi | Kullanıcıya anlaşılır mesaj, form verisi korunur | ✅ |
| N14 | Loading / empty / error ekran durumları | Her üçü de ilgili ekranda gösterilir | ✅ |

## 5. T13 — filtreleme, sayfalama ve sıralama

Ayrıntılı sözleşme: [`t13-filter-contract.md`](t13-filter-contract.md).

| # | Senaryo | Beklenen | Sonuç |
| --- | --- | --- | --- |
| T13-1 | Dashboard'da tek filtre (risk = `HIGH`) | Yalnızca yüksek riskli projeler | ✅ |
| T13-2 | Dashboard'da birden fazla filtre (proje + durum) | AND mantığı uygulanır | ✅ |
| T13-3 | Rapor listesinde hafta filtresi (tam eşleşme) | Yalnızca o haftanın raporu | ✅ |
| T13-4 | Rapor listesinde sayfalama | 12 raporlu projede 2 sayfa (`size=10`) | ✅ |
| T13-5 | Sıralama (`targetProgress,asc`) | Sonuç istenen alana göre sıralı gelir | ✅ |
| T13-6 | Filtre değişince sayfanın sıfırlanması | Sayfa `0`'a döner | ✅ |
| T13-7 | Veritabanı seviyesinde filtreleme doğrulaması | Hibernate SQL debug logunda `WHERE` / `ORDER BY` / `OFFSET ... FETCH FIRST` üretilir | ✅ |
| T13-8 | Dashboard durum filtresinin "en güncel rapor"a uygulanması | En güncel raporu `IN_TEST`, eski raporu `IN_PROGRESS` olan proje, `generalStatus=IN_PROGRESS` filtresinde **listelenmez** | ✅ |

**T13-8 neden önemli:** Bu senaryo, durum filtrelerinin neden veritabanı seviyesine taşınmadığını doğrulayan testtir. Filtre ham `WeeklyReport` satırlarına uygulansaydı bu proje yanlışlıkla listeye girerdi. Gerekçe `t13-filter-contract.md` "Backend Filtreleme Yöntemi" bölümünde açıklanmıştır.

## 6. T14 — yetkilendirme

28. günde **39 senaryo** çalıştırılmıştır: 24 API senaryosu (curl, oturum çerezi ve CSRF token'ı ile) ve 15 tarayıcı senaryosu (dört rol için ayrı oturumlarla). Admin ekranı arayüze bağlandıktan sonra 14 senaryoluk ek bir tarayıcı turu daha yapılmıştır.

Senaryoların tam listesi [`t14-authorization-matrix.md`](t14-authorization-matrix.md) bölüm 10'dadır. Başlıca kategoriler:

| Kategori | Senaryo sayısı | Örnek | Sonuç |
| --- | ---: | --- | --- |
| Kimlik doğrulama | 6 | Pasif kullanıcı girişi engellenir; oturumsuz istek `401` | ✅ |
| Yetki (permission) | 7 | CTO rapor oluşturmayı dener → `403`; PM dashboard'a erişmeye çalışır → `403` | ✅ |
| Kapsam (sahiplik) | 6 | PM atanmadığı projede rapor oluşturmayı dener → `403`; `GET /api/projects` yalnızca atanmış projeleri döner | ✅ |
| Arayüz | 6 | CTO "+ Yeni rapor" butonunu görmez; oturumsuz kullanıcı `/login`'e yönlendirilir | ✅ |
| Regresyon | 6 | T13 filtreleri, sayfalama, sıralama ve `409` davranışı bozulmamıştır | ✅ |
| Admin ekranı | 14 | Tekrarlı e-posta `409` mesajı arayüzde gösterilir; pasife alınan kullanıcı giriş yapamaz | ✅ |

## 7. Bulunan hatalar ve düzeltmeler

Her bulgunun düzeltmesi bir commit ile izlenebilir.

### H1 — Geçersiz JSON gövdesinde teknik detay sızması

| Alan | İçerik |
| --- | --- |
| **Ortam** | Backend, Swagger |
| **Ön koşul** | Herhangi bir POST endpoint'i |
| **Adımlar** | Bozuk JSON veya tanımsız enum değeri gönder |
| **Beklenen** | `400`, kullanıcıya gösterilebilir mesaj |
| **Gerçekleşen** | Jackson'ın ham hata mesajı istemciye dönüyordu |
| **Düzeltme** | `GlobalExceptionHandler`'a `HttpMessageNotReadableException` handler'ı eklendi |
| **Kanıt** | `e47ff7b` — `exception/GlobalExceptionHandler.java` (+11) |
| **Durum** | Kapandı, tekrar test edildi (N6) |

### H2 — Project alanlarında validasyon yokluğu ve tutarsız hata yanıtları

| Alan | İçerik |
| --- | --- |
| **Ortam** | Backend, Swagger |
| **Ön koşul** | `POST /api/projects` |
| **Adımlar** | Proje adı ve müşteri adı boş gönder; ayrıca var olmayan bir yola ve yanlış HTTP metoduyla istek at |
| **Beklenen** | `400` alan hatası; `404` ve `405` için de aynı `ApiErrorResponse` formatı |
| **Gerçekleşen** | Alan kontrolü yoktu; 404/405/tip uyuşmazlığı durumları Spring'in varsayılan gövdesiyle dönüyordu |
| **Düzeltme** | `ProjectCreateRequest`'e `@NotBlank`/`@Size`; `GlobalExceptionHandler`'a `NoHandlerFound`, `NoResourceFound`, `HttpRequestMethodNotSupported`, `MethodArgumentTypeMismatch` handler'ları |
| **Kanıt** | `750bdcc` — `ProjectCreateRequest.java` (+8), `GlobalExceptionHandler.java` (+69), `ProjectController.java` |
| **Durum** | Kapandı, tekrar test edildi (N3, N4, N7) |

### H3 — Frontend'de validasyon geri bildirimi ve tekrar deneme eksikliği

| Alan | İçerik |
| --- | --- |
| **Ortam** | Tarayıcı |
| **Ön koşul** | Proje ve haftalık rapor formları |
| **Adımlar** | Zorunlu alanları boş bırak; API hatası oluştur |
| **Beklenen** | Alan bazlı hata mesajı, form verisinin korunması, tekrar deneme seçeneği |
| **Gerçekleşen** | Hatalar yalnızca genel bir mesajla gösteriliyordu; bazı durumlarda form verisi kayboluyordu |
| **Düzeltme** | Form validasyonu ve hata/tekrar deneme akışı 7 bileşende yeniden düzenlendi |
| **Kanıt** | `ab61bee` — `ProjectCreateForm`, `WeeklyReportForm`, `WeeklyReportList`, `RiskIssueManager`, `WorkItemManager`, `ProjectsPage`, `ReportsPage` (+301/-107) |
| **Durum** | Kapandı, tekrar test edildi (N13, N14) |

### H4 — İş kalemi tarih kurallarının kontrol edilmemesi

| Alan | İçerik |
| --- | --- |
| **Ortam** | Backend + tarayıcı |
| **Ön koşul** | Rapora iş kalemi ekleme |
| **Adımlar** | Tamamlanma tarihini planlanan tarihten önce gir; durumu `COMPLETED` yapıp tamamlanma tarihini boş bırak |
| **Beklenen** | `400`, açıklayıcı mesaj |
| **Gerçekleşen** | Her iki tutarsız kayıt da oluşturulabiliyordu |
| **Düzeltme** | `WorkItemService.validateDatesAndStatus` eklendi; `IllegalArgumentException → 400` eşlemesi yapıldı |
| **Kanıt** | `e2f80bd` — `service/WorkItemService.java` (+35), `exception/GlobalExceptionHandler.java` (+10) |
| **Durum** | Kapandı, tekrar test edildi (N10, N11) |

### H5 — T13 sorgusunda sayfalama ve sıralamanın eksik kalması

| Alan | İçerik |
| --- | --- |
| **Ortam** | Backend, Swagger |
| **Ön koşul** | `GET /api/projects/{projectId}/weekly-reports` |
| **Adımlar** | Çok sayıda raporu olan projede `page`, `size`, `sort` parametrelerini gönder |
| **Beklenen** | Veritabanı seviyesinde sayfalanmış ve sıralanmış sonuç; geçersiz `sort` için `400` |
| **Gerçekleşen** | Filtreleme uygulanıyordu ancak yanıt düz dizi olarak dönüyor, sayfalama/sıralama uygulanmıyordu |
| **Düzeltme** | `PagedResponse` DTO'su, `Pageable`/`PageRequest` kullanımı ve `SORTABLE_FIELDS` allow-list'i eklendi; dashboard sorgusu tek batch sorguya taşındı |
| **Kanıt** | `2ebb164` — `PagedResponse.java` (+22), `WeeklyReportService.java` (+84), `WeeklyReportSpecifications.java` (+66), `DashboardService.java` (+84) |
| **Durum** | Kapandı, tekrar test edildi (T13-4, T13-5, T13-7, N9) |

### H6 — T14 testlerinde bulunan beş yetkilendirme hatası

28. gün testlerinde bulunan beş hata (giriş `500` dönmesi, hataların sunucuda hiç loglanmaması, tarayıcıdan girişin `403` dönmesi, çıkış butonunun erişilebilir adı, başlıktaki boşluk sorunu) ayrıntılı kök neden ve düzeltme açıklamalarıyla [`t14-authorization-matrix.md`](t14-authorization-matrix.md) bölüm 12'de kayıtlıdır.

**Kanıt:** `f801fd5` — `AuthService.java`, `AuthController.java`, `GlobalExceptionHandler.java`, `apiClient.ts`, `MainLayout.tsx`
**Durum:** Beşi de kapandı; düzeltme sonrası 39 senaryonun tamamı tekrar çalıştırıldı ve geçti.

### H7 — `npm run lint` 10 hata veriyor (AÇIK)

| Alan | İçerik |
| --- | --- |
| **Ortam** | Frontend |
| **Adımlar** | `cd frontend && npm run lint` |
| **Beklenen** | Hatasız tamamlanması |
| **Gerçekleşen** | 10 error: 8 × `react-hooks/set-state-in-effect`, 2 × `react-refresh/only-export-components` |
| **Etkilenen dosyalar** | `DashboardReportDetailDialog`, `DashboardRiskIssueList`, `DashboardWorkItemList`, `MainLayout`, `DashboardPage`, `ProjectsPage`, `ReportsPage` (2), `NotificationProvider`, `ColorModeProvider` |
| **Analiz** | Sekiz uyarının tamamı `useEffect` içinde veri çekme desenine aittir (`useEffect(() => { void load(); }, [load])`) ve `eslint-plugin-react-hooks` v7'nin yeni derleyici tabanlı kuralından kaynaklanır; **çalışma zamanı hatası değildir** ve üretim build'ini etkilemez (A4 başarılı). Kalan iki uyarı yalnızca geliştirme sırasındaki Fast Refresh konforuyla ilgilidir |
| **Önem** | Düşük |
| **Durum** | **AÇIK.** Düzeltme, sekiz sayfanın veri yükleme mantığının yeniden yazılmasını gerektirdiği için teslim tarihine bu kadar yakın bilinçli olarak ertelenmiştir |

## 8. Tekrar test

Düzeltmelerden sonra yalnızca ilgili senaryo değil, etkilenen akışların tamamı yeniden çalıştırılmıştır:

- **H5 sonrası (T13):** Filtreler, sayfalama, sıralama ve geçersiz `sort` davranışı (T13-1…T13-8, N9) yeniden koşuldu.
- **H6 sonrası (T14):** 39 senaryonun tamamı yeniden koşuldu; ayrıca regresyon kategorisiyle T13 davranışlarının bozulmadığı ayrıca doğrulandı (`t14-authorization-matrix.md` bölüm 10, madde 26-31).
- **Yetkilendirme sonrası MVP regresyonu:** Rapor oluşturma, iş kalemi ve risk/engel akışları, `409` tekrar kayıt davranışı ve loading/empty/error durumları yetkili kullanıcı oturumunda yeniden doğrulandı.
- **26.08.2026:** Backend derleme, backend testi ve frontend build'i yeniden çalıştırıldı (bölüm 2).

## 9. Kalan riskler

Bu bölüm bilinçli olarak dürüst tutulmuştur; aşağıdakiler projenin bilinen zayıf noktalarıdır.

| # | Risk | Etki | Neden kabul edildi |
| --- | --- | --- | --- |
| R1 | **Otomatik test kapsamı pratikte yok.** Çalışan tek test `contextLoads()`. İş kuralları, yetkilendirme, filtreleme ve validasyon davranışlarının hiçbiri otomatik olarak korunmuyor | **Yüksek.** Bir regresyon yalnızca manuel testle yakalanabilir; refactoring riski yüksek | Teknik Karar Notu bölüm 9'da JUnit/Mockito planlanmıştı ancak uygulanmadı. Teslim tarihine kadar anlamlı bir test paketi yazmak mümkün değildi; aceleyle yazılmış zayıf testler gerçek kapsam yerine yanlış güven üretirdi |
| R2 | **E2E / tarayıcı testleri repository'de saklanmıyor.** Rol senaryoları tarayıcı üzerinden çalıştırıldı, ancak yeniden koşulabilir bir artefakt yok | Orta. Sonuçlar bu dokümana ve `t14-authorization-matrix.md`'ye dayanıyor, otomatik olarak yeniden üretilemiyor | Otomatik E2E altyapısı kurmak T14 kapsamının dışındaydı |
| R3 | `npm run lint` 10 hata veriyor (H7) | Düşük. Üretim build'ini etkilemiyor | Bkz. H7 |
| R4 | **Haftalık rapor ve proje güncelleme endpointleri yok.** Ön Analiz bölüm 7.4 ve 12.2/12.3'te planlanmıştı | Orta. Kullanıcı yanlış girilen bir raporu düzeltemez | Ön Analiz bölüm 14, açık soru 3 ("geçmiş raporlar düzenlenebilir mi") cevaplanmamış olduğu için karar `t14-authorization-matrix.md` bölüm 7'de bilinçli olarak ertelendi |
| R5 | **İş kalemi ilerleme yüzdesi alanı yok.** Ön Analiz bölüm 7.5 iş kuralı 2'de planlanmıştı | Düşük. İş kalemi durumu (`PLANNED`/`IN_PROGRESS`/`IN_TEST`/`COMPLETED`/`BLOCKED`) MVP için yeterli granülerliği sağlıyor | Kapsam kararı; ayrıca README "Bilinen Eksikler" bölümüne yazıldı |
| R6 | **Dashboard'da N+1 sorgu.** Her proje için ayrı `countByWeeklyReport_IdAndStatusIn` çağrısı yapılıyor (`DashboardService`) | Düşük. Demo ölçeğinde (6 proje) ölçülemez; proje sayısı arttıkça büyür | Performans optimizasyonu MVP kapsamı dışında bırakıldı |
| R7 | **Sürümlenmiş migration yok.** Şema `ddl-auto=update` ile yönetiliyor | Orta. Üretim ortamı için uygun değil | MVP kapsamı dışı; yönetmelik bölüm 5.5 bu tür konuları genişletme aşamasına bırakıyor |
| R8 | **Deployment yapılmadı.** Proje doğrulanmış lokal ortam üzerinden çalıştırılıyor | Düşük. Yönetmelik bölüm 1.1 lokal demoyu kabul ediyor | Kurulum adımları README'de eksiksiz belgelendi ve temiz ortamda doğrulandı |

## 10. Sonuç

Fonksiyonel MVP akışları, negatif/validasyon senaryoları, T13 filtreleme-sayfalama-sıralama davranışları ve T14 yetkilendirme kuralları manuel olarak doğrulanmış; bulunan yedi hatanın altısı düzeltilerek tekrar test edilmiştir. Bir bulgu (H7) düşük öncelikli olarak açık bırakılmıştır.

Projenin en büyük kalan riski R1'dir: **testlerin geçiyor olması, sistemin test edildiği anlamına gelmemektedir.** Otomatik kapsamın oluşturulması bir sonraki adımdır.
