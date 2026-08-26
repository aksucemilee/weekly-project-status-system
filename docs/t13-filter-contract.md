# T13 Filtre Sözleşmesi

Bu doküman, 21-24. gün (T13: Filtreleme ve Durum Zenginleştirme) kapsamında eklenecek filtrelerin veri ve API sözleşmesini tanımlar.

## Dashboard (`GET /api/dashboard`)

| Filtre | Frontend alan | API parametresi | Tip | Değerler | Opsiyonel |
| --- | --- | --- | --- | --- | --- |
| Proje | `projectId` (select) | `projectId` | `Long` | - | Evet |
| Hafta | `weekStart` (date) | `weekStart` | `LocalDate` (ISO) | - | Evet — pencere: `weekStart` .. `weekStart + 6 gün` |
| Genel durum | `generalStatus` (select) | `generalStatus` | enum `GeneralStatus` | PLANNED, IN_PROGRESS, IN_TEST, COMPLETED, DELAYED, AT_RISK, BLOCKED | Evet |
| Risk seviyesi | `riskLevel` (select) | `riskLevel` | enum `RiskLevel` | LOW, MEDIUM, HIGH | Evet |
| **Takvim durumu (gecikme)** — yeni | `scheduleStatus` (select) | `scheduleStatus` | enum `ScheduleStatus` | ON_TRACK, DELAYED | Evet |

İlk dördü zaten mevcuttu ve değişmedi; `scheduleStatus` bu kapsamda eklenecek tek yeni parametre.

- **Birlikte kullanım:** Tüm filtreler AND mantığıyla birlikte uygulanır (mevcut davranış, değişmiyor).
- **Temizle:** Var olan "Temizle" davranışı korunur, yeni alan da sıfırlanır.
- **Boş sonuç:** Mevcut `EmptyState` bileşeni kullanılır (değişiklik yok).
- **Loading:** Mevcut davranış korunur.
- **API hatası:** Mevcut "Tekrar dene" akışı korunur.

## Haftalık Rapor Listesi (`GET /api/projects/{projectId}/weekly-reports`)

| Filtre | Frontend alan | API parametresi | Tip | Opsiyonel |
| --- | --- | --- | --- | --- |
| Proje | mevcut proje seçici (path variable) | path `{projectId}` | - | Hayır (zaten zorunlu) |
| Hafta | `weekStart` (date) | `weekStart` | `LocalDate` | Evet — **tam eşleşme** (Dashboard'daki pencereden farklı; burada gerçek rapor satırları listelendiği için tek bir `reportWeekStart` değeriyle eşleşme daha doğru) |
| Genel durum | `generalStatus` (select) | `generalStatus` | enum `GeneralStatus` | Evet |
| Risk seviyesi | `riskLevel` (select) | `riskLevel` | enum `RiskLevel` | Evet |
| Takvim durumu | `scheduleStatus` (select) | `scheduleStatus` | enum `ScheduleStatus` | Evet |
| Sayfa | frontend'de otomatik yönetilir (Pagination bileşeni) | `page` | `int` (0 tabanlı) | Evet — varsayılan `0` |
| Sayfa boyutu | frontend'de sabit `10` | `size` | `int` | Evet — varsayılan `20` (frontend `10` gönderir) |
| Sıralama | şu an ayrı bir UI kontrolü yok, backend destekliyor | `sort` | `alan,yön` (örn. `targetProgress,asc`) | Evet — varsayılan `reportWeekStart,desc` |

- **Yanıt gövdesi:** Artık düz bir dizi değil, sayfalanmış bir gövde döner:
  ```json
  {
    "content": [ /* WeeklyReportResponse[] */ ],
    "page": 0,
    "size": 10,
    "totalElements": 4,
    "totalPages": 1
  }
  ```
- **Sıralama alanları:** `reportWeekStart`, `targetProgress`, `actualProgress` (allow-list). Bunların dışında bir alan veya `asc`/`desc` dışında bir yön gönderilirse backend `400 Bad Request` döner (mevcut merkezi `GlobalExceptionHandler`'ın `IllegalArgumentException → 400` eşlemesi üzerinden, ek bir hata yönetimi kodu yazılmadı).
- **Birlikte kullanım:** Tüm filtreler AND mantığıyla, sayfalama ve sıralamayla birlikte çalışır.
- **Filtre değişince sayfa sıfırlanır:** Frontend'de herhangi bir filtre veya proje değişikliğinde sayfa `0`'a döner (`ReportsPage.tsx` içindeki `handleReportFiltersChange` / `handleProjectChange`).
- **Filtre UI'ı:** Dashboard'daki "düzenle → Uygula" akışının aksine, tüm alanlar `select` tipinde olduğu için değişiklik anında uygulanır (ayrı bir "Uygula" butonu gerekmiyor); tek bir "Temizle" butonu tüm filtreleri sıfırlar.
- **Boş sonuç:** Proje hiç rapor içermiyorsa mevcut "Bu proje için henüz rapor yok" mesajı; filtre sonucu boşsa "Seçilen filtrelere uygun rapor bulunamadı" mesajı gösterilir (ayrım yapılır).
- **Loading / API hatası:** Mevcut davranış korunur.

## Sorumlu Filtresi — T14'e Ertelendi

`Project` entity'sinde bir "sorumlu proje yöneticisi" alanı veya kullanıcı ilişkisi bulunmuyor; sistemde henüz authentication/RBAC yok (T14, 25-28. gün için planlı). `WorkItem` ve `RiskIssue`'daki `responsible` alanları serbest metin olup proje sorumlusu kavramıyla eşleşmiyor.

Bu nedenle T13 kapsamında sahte bir proje sorumlusu filtresi kurulmuyor. Sorumlu filtresi, T14'te `User`/`ProjectAssignment` benzeri bir veri modeli oluşturulduktan sonra: `Dashboard` ve rapor listesi endpointlerine `responsibleUserId` (veya benzeri) parametresi eklenerek, projenin atanmış kullanıcısına göre filtrelenerek tamamlanacaktır.

### Yetki Etkisi (RBAC) — T14'e Ertelendi, Genişletme Notu

Sistemde şu an authentication/authorization (RBAC) yok, bu nedenle T13 kapsamında sahte bir yetki filtresi kurulmadı. Ancak `WeeklyReportSpecifications` yapısı bu genişlemeye uygun kurulmuştur: T14'te RBAC eklendiğinde, oturum açmış kullanıcının yetkili olduğu proje id listesi (`allowedProjectIds`) `WeeklyReportSpecifications.projectIdIn(allowedProjectIds)` ile mevcut `Specification.and(...)` zincirine tek bir ek predicate olarak eklenebilir — `DashboardService.findLatestReportsForProjects` zaten `projectIdIn` kullandığı için aynı predicate doğrudan tekrar kullanılabilir, servis/controller imzalarını kırmadan.

## Sayfalama ve Sıralama

- **Haftalık rapor listesi (`GET /api/projects/{projectId}/weekly-reports`):** Spring Data `Pageable`/`PageRequest` ile gerçek sayfalama ve sıralama uygulanır (bkz. yukarıdaki tablo). Yanıt `PagedResponse<WeeklyReportResponse>` olarak döner.
- **Dashboard (`GET /api/dashboard`):** Kasıtlı olarak sayfalanmıyor. CTO'nun tüm portföyü tek ekranda karşılaştırması gereken bir görünüm olduğu için (proje sayısı onlarca seviyede kaldığı sürece) sayfalama kullanıcı deneyimini bozar; yönetmeliğin sayfalama beklentisi T13 kapsamında rapor listesi endpoint'i üzerinden karşılanmıştır. Dashboard'daki `projectId`/`weekStart` filtreleri yine de `Specification` ile veritabanı seviyesinde uygulanır (bkz. aşağıdaki bölüm); sadece sonuç sayfalara bölünmez.

## Backend Filtreleme Yöntemi

`WeeklyReport` için `WeeklyReportRepository`, `JpaSpecificationExecutor<WeeklyReport>` genişletir. `WeeklyReportSpecifications` sınıfı, `projectId`/`weekStart`/`generalStatus`/`riskLevel`/`scheduleStatus` için opsiyonel, birbiriyle AND ile birleştirilebilen `Specification<WeeklyReport>` üreten statik metotlar içerir (değer `null` ise predicate üretilmez, filtre otomatik olarak devre dışı kalır).

- **`WeeklyReportService.getReportsByProject`:** Tüm filtreleri tek bir `Specification`'da birleştirip `weeklyReportRepository.findAll(specification, pageable)` ile TEK bir veritabanı sorgusunda filtreleme + sayfalama + sıralama uygular. Kök entity `WeeklyReport`'tur (her filtre alanı doğrudan bu entity'nin kendi kolonu veya `project.id` üzerinden erişilir).
- **`DashboardService`:** Kök entity yine `WeeklyReport`'tur, ancak buradaki iş kuralı farklıdır — Dashboard her proje için "seçilen pencere içindeki EN GÜNCEL rapor"u gösterir ve `generalStatus`/`riskLevel`/`scheduleStatus` filtreleri bu SEÇİLMİŞ rapora uygulanır, ham satırlara değil. Bu yüzden yalnızca `projectId` (proje listesi zaten aktif+seçili projelerle sınırlı) ve `weekStart` penceresi `WeeklyReportSpecifications.projectIdIn(...).and(weekStartBetween(...))` ile TEK bir batch sorguya taşınmıştır (`findLatestReportsForProjects`); durum filtreleri ise "en güncel rapor" seçildikten SONRA Java tarafında uygulanmaya devam eder. Bunun nedeni somut bir örnekle test edilip doğrulanmıştır: bir projenin en güncel raporu `IN_TEST`, daha eski bir raporu `IN_PROGRESS` olduğunda, `generalStatus=IN_PROGRESS` filtresi bu projeyi YANLIŞLIKLA dahil etmemelidir — durum filtresini veritabanı seviyesine taşımak bu davranışı bozar. Bu senaryo gerçek veriyle API üzerinden doğrulanmıştır (bkz. [`test-raporu.md`](test-raporu.md), senaryo T13-8).
- **Sonuç:** Filtreleme artık gerçekten veritabanı seviyesinde çalışır (Hibernate `SQL` debug logunda üretilen `WHERE`/`ORDER BY`/`OFFSET ... FETCH FIRST` ifadeleriyle doğrulanmıştır), Java `Stream.filter()` yalnızca Dashboard'ın durum-bazlı son adımında, yukarıda açıklanan zorunlu nedenle kullanılmaya devam eder.
