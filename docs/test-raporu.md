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

Final kapsam denetimi (26.08.2026, aynı gün, kod değişikliklerinden sonra) tekrar çalıştırıldı:

| # | Kontrol | Komut | Sonuç |
| --- | --- | --- | --- |
| A6 | Backend derleme | `mvnw -DskipTests compile` | ✅ `BUILD SUCCESS` |
| A7 | Backend test | `mvnw test` | ✅ `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0` |
| A8 | Frontend production build | `npm run build` | ✅ `built in 518ms` |
| A9 | Frontend lint | `npm run lint` | ❌ **10 error** — değişmedi, hâlâ H7 |

A7 hakkındaki dürüst not (aşağıda) geçerliliğini korur: eklenen güncelleme endpointleri için de otomatik test yazılmamıştır, doğrulama bölüm 10'daki manuel API senaryolarıyla yapılmıştır.

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

### H8 — Enum'a yeni değer eklendiğinde uygulama mevcut veritabanında açılmıyor

| Alan | İçerik |
| --- | --- |
| **Ortam** | Backend + PostgreSQL 18.1 (mevcut, daha önce oluşturulmuş şema) |
| **Ön koşul** | `ddl-auto=update`; veritabanı önceki enum değerleriyle oluşturulmuş |
| **Adımlar** | `PermissionCode` enum'una `REPORT_UPDATE` eklendi ve uygulama başlatıldı |
| **Beklenen** | `AuthorizationDataInitializer` yeni yetkiyi seed eder, uygulama açılır |
| **Gerçekleşen** | Açılış başarısız: `ERROR: new row for relation "permissions" violates check constraint "permissions_code_check"` (`SQLState: 23514`) |
| **Kök neden** | Hibernate 6.2+, `@Enumerated(EnumType.STRING)` kolonları için enum değerlerini listeleyen bir `CHECK` constraint üretir. `ddl-auto=update` yalnızca ekleme yapar; **mevcut constraint'i güncellemez.** Sorun `PermissionCode`'a özgü değildir; `GeneralStatus`, `ProjectStatus`, `WorkItemStatus` gibi tüm enum kolonları aynı davranışa sahiptir |
| **Etki** | Temiz kurulumda **sorun yok** (Hibernate tabloyu güncel enum listesiyle oluşturur). Yalnızca mevcut bir veritabanı etkilenir |
| **Düzeltme** | Constraint, temiz kurulumun üreteceğiyle birebir aynı olacak şekilde tek seferlik senkronlandı: `ALTER TABLE permissions DROP CONSTRAINT permissions_code_check;` ardından güncel 12 değerle yeniden eklendi |
| **Önem** | Orta — sessiz veri bozulmasına yol açmaz, uygulama açılışta net bir hatayla durur |
| **Durum** | Bu değişiklik için kapandı; **yapısal olarak AÇIK** (bkz. R7). Sürümlenmiş migration (Flyway/Liquibase) eklenmediği sürece her yeni enum değeri aynı adımı gerektirir |

**Neden kayda değer:** Bu bulgu R7'nin ("sürümlenmiş migration yok") soyut bir risk olmadığını, ilk şema değişikliğinde somut olarak ortaya çıktığını gösterir. Derleme ve testler bu hatayı yakalamaz; yalnızca uygulamayı mevcut bir veritabanına karşı gerçekten çalıştırmak ortaya çıkarır.

### H9 — Seeder idempotent değildi: her açılışta yeni proje ataması üretiyordu

| Alan | İçerik |
| --- | --- |
| **Ortam** | Backend + PostgreSQL |
| **Ön koşul** | `SEED_USER_PASSWORD` tanımlı; veritabanında hem `AuthorizationDataInitializer` hem `DemoDataInitializer` verisi mevcut |
| **Adımlar** | Uygulamayı arka arkaya birkaç kez başlat, `project_assignments` satır sayısını izle |
| **Beklenen** | Sayı sabit kalır (README: "Her iki seeder de **idempotent**tir; uygulama her açıldığında veri çoğalmaz") |
| **Gerçekleşen** | Atama sayısı 5 → 7'ye çıktı; dashboard'da daha önce "Sorumlu: Atanmadı" görünen `Arşiv Raporlama Altyapısı` projesi sorumlu göstermeye başladı |
| **Kök neden** | `seedDemoAssignments`, projeleri **isme göre alfabetik** sıralayıp "ilk iki projeyi" atıyordu. `DemoDataInitializer` sonradan yeni projeler eklediği için alfabetik ilk iki proje değişti; mevcut atama kontrolü ise yalnızca *o proje* için yapıldığından, yeni baştaki projeler için her açılışta yeni atama üretildi |
| **Etki** | Demo verisi sessizce değişiyor: rol kapsamı senaryosu ("PM 3 proje görür") bozuluyor ve dashboard'daki sorumlu sütunu kayıyor. Sessiz veri değişimi olduğu için fark edilmesi zor |
| **Düzeltme** | `assignDemoUser` artık kullanıcının **hiç aktif ataması yoksa** çalışır; varsa hiç dokunmaz |
| **Kanıt** | Düzeltme sonrası uygulama iki kez arka arkaya başlatıldı; `project_assignments` her ikisinde de 5 satırda kaldı (kullanıcı 4, proje 6, rapor 23 sabit) |
| **Önem** | Orta |
| **Durum** | Kapandı, tekrar test edildi |

**Not:** Bu kusur, denetim sırasında demo kullanıcı isimleri değiştirilirken uygulamanın birkaç kez yeniden başlatılması sayesinde ortaya çıktı; tek seferlik çalıştırmada görünmüyordu.

### H10 — Aynı takvim haftasına birden fazla rapor girilebiliyordu

| Alan | İçerik |
| --- | --- |
| **Ortam** | Backend + tarayıcı |
| **Ön koşul** | Bir projede `13.07.2026` haftasına ait rapor mevcut |
| **Adımlar** | Raporun haftasını `07.07.2026` (aynı haftanın Salı'sı değil, bir önceki haftanın Salı'sı) gibi Pazartesi olmayan bir güne çek; ardından aynı haftanın başka bir gününe ikinci rapor oluşturmayı dene |
| **Beklenen** | Aynı proje ve hafta için tek rapor (Ön Analiz bölüm 14, açık soru 2) |
| **Gerçekleşen** | Girilen gün olduğu gibi saklanıyordu ve benzersizlik kısıtı **tam tarih** üzerindeydi. Aynı takvim haftasının Pazartesi ve Salı'sı ayrı dönem sayılıyor, dolayısıyla aynı haftaya iki rapor girilebiliyordu |
| **Kök neden** | Alan adı `reportWeekStart` ve sistemin geri kalanı hafta varsayıyordu (dashboard `weekStart .. +6 gün` penceresi, seeder çıktısı, "güncel hafta" filtresi), ancak **kayıt adımı bu varsayımı zorlamıyordu.** Ön Analiz bölüm 14, açık soru 8 (rapor dönemi modeli) cevapsız bırakılmıştı |
| **Etki** | Orta. `409` kuralı var gibi görünüyor ama yanlış eksende çalışıyordu; CTO'nun aynı haftaya ait iki rapordan hangisine bakacağı belirsiz kalırdı. Bu, yönetmelik bölüm 5'te tarif edilen asıl problemi ("güncel tek bir kaynağın oluşmaması") sisteme geri getirirdi |
| **Düzeltme** | Rapor dönemi ISO haftasının Pazartesi'sine normalize edilir; kural oluşturma, güncelleme, liste filtresi ve dashboard penceresinde aynı şekilde uygulanır. Karar ve gerekçesi [`t14-authorization-matrix.md`](t14-authorization-matrix.md) bölüm 13.4'te |
| **Kanıt** | Bölüm 10.3'teki 11 senaryo; mevcut 23 raporun tamamının zaten Pazartesi olduğu SQL ile doğrulandı, veri göçü gerekmedi |
| **Önem** | Orta |
| **Durum** | Kapandı, tekrar test edildi (W1–W11) |

**Not:** Bu bulgu, denetim değil **manuel kullanıcı testi** sırasında ortaya çıktı: rapor haftası elle değiştirildiğinde beklenen `409` gelmedi. İlk bakışta çakışma kuralının bozuk olduğu düşünüldü; incelemede kuralın çalıştığı ancak **yanlış eksende** çalıştığı görüldü. Seeder her zaman Pazartesi ürettiği için demo veride hiç görünmüyordu.

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
| ~~R4~~ | ~~**Haftalık rapor ve proje güncelleme endpointleri yok.**~~ **KAPANDI (26.08.2026).** Her iki endpoint de final kapsam denetiminde eklendi ve bölüm 10'daki senaryolarla doğrulandı. Gerekçe: [`t14-authorization-matrix.md`](t14-authorization-matrix.md) bölüm 13 | — | **Silme** endpointleri hâlâ yok ve bilinçli olarak kapsam dışı (Ön Analiz 12.3, açık soru 3) |
| R5 | **İş kalemi ilerleme yüzdesi alanı yok.** Ön Analiz bölüm 7.5 iş kuralı 2'de planlanmıştı | Düşük. İş kalemi durumu (`PLANNED`/`IN_PROGRESS`/`IN_TEST`/`COMPLETED`/`BLOCKED`) MVP için yeterli granülerliği sağlıyor | Kapsam kararı; ayrıca README "Bilinen Eksikler" bölümüne yazıldı |
| R6 | **Dashboard'da N+1 sorgu.** Her proje için ayrı `countByWeeklyReport_IdAndStatusIn` çağrısı yapılıyor (`DashboardService`) | Düşük. Demo ölçeğinde (6 proje) ölçülemez; proje sayısı arttıkça büyür | Performans optimizasyonu MVP kapsamı dışında bırakıldı |
| R7 | **Sürümlenmiş migration yok.** Şema `ddl-auto=update` ile yönetiliyor. **Bu risk 26.08.2026'da somutlaştı:** enum'a yeni bir değer eklendiğinde mevcut veritabanında uygulama açılmıyor (bkz. H8) | Orta → **Yüksek**. Artık teorik değil, gerçekleşmiş bir kusur. Her yeni enum değeri elle SQL gerektiriyor | MVP kapsamı dışı; yönetmelik bölüm 5.5 bu tür konuları genişletme aşamasına bırakıyor. Flyway/Liquibase eklenmesi README "Geliştirme Planı" bölümünde 3. sıraya alındı |
| R8 | **Deployment yapılmadı.** Proje doğrulanmış lokal ortam üzerinden çalıştırılıyor | Düşük. Yönetmelik bölüm 1.1 lokal demoyu kabul ediyor | Kurulum adımları README'de eksiksiz belgelendi ve temiz ortamda doğrulandı |

## 10. Final kapsam denetimi senaryoları (26.08.2026)

Denetimde eklenen üç özellik için aşağıdaki senaryolar, backend ve PostgreSQL çalışır durumdayken **curl ile gerçek HTTP istekleri** gönderilerek çalıştırılmıştır. Her istek oturum çerezi ve `X-XSRF-TOKEN` başlığı ile yapılmış; sonuçlar HTTP durum kodu ve yanıt gövdesiyle doğrulanmıştır.

Test için üç geçici kullanıcı (proje yöneticisi, CTO, admin) oluşturulmuş, senaryolar sonrası **veritabanından silinmiştir**; değiştirilen demo kayıtları özgün değerlerine geri yüklenmiştir.

### 10.1 Haftalık rapor güncelleme (`PUT .../weekly-reports/{id}`)

| # | Senaryo | Beklenen | Sonuç |
| --- | --- | --- | --- |
| U1 | Proje yöneticisi, atandığı projedeki raporu günceller | `200`, güncel gövde döner | ✅ |
| U2 | Hedeflenen ilerleme `120` | `400`, "Hedeflenen ilerleme 100 veya daha küçük olmalıdır." | ✅ |
| U3 | Zorunlu alan boşluk karakteriyle gönderilir | `400`, "Yapılanlar alanı zorunludur." | ✅ |
| U4 | Rapor haftası, aynı projedeki başka bir raporun haftasına taşınır | `409 Conflict` | ✅ |
| U5 | CTO aynı isteği gönderir | `403` | ✅ |
| U6 | Admin aynı isteği gönderir | `403` | ✅ |
| U7 | Proje yöneticisi, **atanmadığı** projenin raporunu günceller | `403`, "Bu proje üzerinde işlem yapma yetkiniz bulunmuyor." | ✅ |
| U8 | Oturumsuz istek (geçerli CSRF token ile) | `401` | ✅ |
| U9 | Var olmayan rapor kimliği | `404` | ✅ |
| U10 | Güncellemenin veritabanına yazılması | `updated_at` değişir, alanlar kalıcı olur | ✅ (SQL ile doğrulandı) |

**U8 hakkında not:** İlk denemede CSRF token'ı hiç gönderilmediği için `403` alındı. Bu beklenen davranıştır — CSRF filtresi kimlik doğrulamadan önce çalışır. Token gönderilip oturum açılmadığında yanıt doğru şekilde `401` olmaktadır. Bu, mevcut bir davranıştır ve bu denetimde değişmemiştir.

### 10.2 Proje güncelleme (`PUT /api/projects/{id}`)

| # | Senaryo | Beklenen | Sonuç |
| --- | --- | --- | --- |
| P1 | Admin proje durumunu `BLOCKED` yapar | `200` | ✅ |
| P2 | Dashboard "bloke proje" sayacı | `0` → `1` | ✅ |
| P3 | Proje yöneticisi aynı isteği gönderir | `403` | ✅ |
| P4 | CTO aynı isteği gönderir | `403` | ✅ |
| P5 | Proje adı boşluk karakteriyle gönderilir | `400`, "Proje adı zorunludur." | ✅ |
| P6 | `status` alanı hiç gönderilmez | `400`, "Proje durumu zorunludur." | ✅ |
| P7 | Var olmayan proje kimliği | `404` | ✅ |
| P8 | Admin projeyi `active=false` yapar | `200` | ✅ |
| P9 | Pasife alınan proje dashboard'da | Listeden çıkar, toplam `6` → `5` | ✅ |

### 10.3 Rapor dönemi hafta normalizasyonu

Bulgu H10 sonrası çalıştırılan senaryolar. Gerekçe: [`t14-authorization-matrix.md`](t14-authorization-matrix.md) bölüm 13.4.

| # | Senaryo | Gönderilen | Beklenen | Sonuç |
| --- | --- | --- | --- | --- |
| W1 | Çarşamba gönder | `2026-07-15` | `2026-07-13` kaydedilir | ✅ |
| W2 | Pazar gönder | `2026-07-19` | `2026-07-13` kaydedilir | ✅ |
| W3 | Pazartesi gönder | `2026-07-13` | Aynen kalır | ✅ |
| W4 | Dolu haftanın Çarşambası | `2026-07-22` | `409`, mesajda hafta `2026-07-20` | ✅ |
| W5 | Dolu haftanın Pazarı | `2026-07-26` | `409` | ✅ |
| W6 | Filtre: hafta başı | `weekStart=2026-07-13` | 1 kayıt | ✅ |
| W7 | Filtre: hafta ortası | `weekStart=2026-07-15` | 1 kayıt | ✅ |
| W8 | Filtre: hafta sonu | `weekStart=2026-07-19` | 1 kayıt | ✅ |
| W9 | Oluşturmada normalizasyon | `2026-09-16` (Çrş) | `201`, `2026-09-14` kaydedilir | ✅ |
| W10 | Oluşturmada aynı hafta | `2026-09-18` (Cum) | `409` | ✅ |
| W11 | Dashboard penceresi kaymamalı | `weekStart` = 24/26/30 Ağustos | Üçünde de aynı sayaçlar | ✅ |

W11 önemli: normalizasyon öncesi `weekStart=2026-08-26` gönderildiğinde pencere `26.08 – 01.09` oluyor ve o haftanın (`24.08`) raporu **pencere dışında** kalıyordu.

**Veri doğrulaması:** Test sonrası `weekly_reports` 23 satırda kaldı ve tamamı Pazartesi tarihli (`extract(isodow) <> 1` sorgusu 0 döndü). Test amaçlı oluşturulan rapor silindi.

### 10.4 Sorumlu proje yöneticisi

| # | Senaryo | Beklenen | Sonuç |
| --- | --- | --- | --- |
| S1 | `GET /api/dashboard` yanıtı | Atanmış 3 projede sorumlu adı, diğerlerinde `null` | ✅ |
| S2 | `GET /api/projects` yanıtı | Aynı sonuç | ✅ |
| S3 | Sorgu sayısı | Sorumlular proje başına ayrı sorgu yapılmadan tek sorguda okunur | ✅ (toplu sorgu kullanıldı) |

### 10.5 Doğrulanmayanlar — dürüst not

Aşağıdakiler bu denetimde **çalıştırılmamıştır** ve teslim öncesi tarayıcıda manuel doğrulanmalıdır:

- Rapor ve proje düzenleme formlarının tarayıcı üzerinden uçtan uca kullanımı (alan doldurma, gönderme, bildirim, liste yenilenmesi)
- "Raporu düzenle" ve "Düzenle" butonlarının rol bazlı görünürlüğü
- Marka logosu düzeltmesinin dört rolde davranışı
- Admin'de iş kalemi/risk sekmelerinin gizlenmesi

Backend davranışı yukarıdaki API senaryolarıyla, arayüz kodu ise `tsc` tip kontrolü ve production build ile doğrulanmıştır; ancak bunlar tarayıcı testinin yerine geçmez.

## 11. Sonuç

Fonksiyonel MVP akışları, negatif/validasyon senaryoları, T13 filtreleme-sayfalama-sıralama davranışları ve T14 yetkilendirme kuralları manuel olarak doğrulanmış; bulunan sekiz hatanın yedisi düzeltilerek tekrar test edilmiştir. Bir bulgu (H7) düşük öncelikli olarak açık bırakılmıştır.

26.08.2026 tarihli final kapsam denetiminde MVP'de eksik kalan üç konu (rapor güncelleme, proje güncelleme, sorumlu proje yöneticisi gösterimi) tamamlanmış ve bölüm 10'daki 22 API senaryosuyla doğrulanmıştır. Aynı denetimde iki arayüz yetkilendirme kusuru ve bir şema evrimi kusuru (H8) bulunmuştur.

Projenin en büyük kalan riski R1'dir: **testlerin geçiyor olması, sistemin test edildiği anlamına gelmemektedir.** Bu denetimde eklenen özellikler de otomatik testle korunmamaktadır. Otomatik kapsamın oluşturulması bir sonraki adımdır.

İkinci sırada R7 gelir: H8, sürümlenmiş migration eksikliğinin artık teorik bir risk olmadığını göstermiştir.
