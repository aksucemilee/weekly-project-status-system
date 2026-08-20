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

Şu an bu endpoint hiçbir filtre parametresi almıyor; tüm raporları `reportWeekStart DESC` sırayla döndürüyor.

| Filtre | Frontend alan | API parametresi | Tip | Opsiyonel |
| --- | --- | --- | --- | --- |
| Proje | mevcut proje seçici (path variable) | path `{projectId}` | - | Hayır (zaten zorunlu) |
| Hafta | `weekStart` (date) | `weekStart` | `LocalDate` | Evet — **tam eşleşme** (Dashboard'daki pencereden farklı; burada gerçek rapor satırları listelendiği için tek bir `reportWeekStart` değeriyle eşleşme daha doğru) |
| Genel durum | `generalStatus` (select) | `generalStatus` | enum `GeneralStatus` | Evet |
| Risk seviyesi | `riskLevel` (select) | `riskLevel` | enum `RiskLevel` | Evet |
| Takvim durumu | `scheduleStatus` (select) | `scheduleStatus` | enum `ScheduleStatus` | Evet |

- **Sıralama:** Mevcut `reportWeekStart DESC` korunur; ayrı bir sıralama parametresi eklenmiyor (tek bir mantıklı varsayılan sıralama var, ek karmaşıklık gerektirmiyor).
- **Birlikte kullanım:** AND mantığı.
- **Filtre UI'ı:** Dashboard'daki "düzenle → Uygula" akışının aksine, tüm alanlar `select` tipinde olduğu için değişiklik anında uygulanır (ayrı bir "Uygula" butonu gerekmiyor); tek bir "Temizle" butonu tüm filtreleri sıfırlar.
- **Boş sonuç:** Proje hiç rapor içermiyorsa mevcut "Bu proje için henüz rapor yok" mesajı; filtre sonucu boşsa "Seçilen filtrelere uygun rapor bulunamadı" mesajı gösterilir (ayrım yapılır).
- **Loading / API hatası:** Mevcut davranış korunur.

## Sorumlu Filtresi — T14'e Ertelendi

`Project` entity'sinde bir "sorumlu proje yöneticisi" alanı veya kullanıcı ilişkisi bulunmuyor; sistemde henüz authentication/RBAC yok (T14, 25-28. gün için planlı). `WorkItem` ve `RiskIssue`'daki `responsible` alanları serbest metin olup proje sorumlusu kavramıyla eşleşmiyor.

Bu nedenle T13 kapsamında sahte bir proje sorumlusu filtresi kurulmuyor. Sorumlu filtresi, T14'te `User`/`ProjectAssignment` benzeri bir veri modeli oluşturulduktan sonra: `Dashboard` ve rapor listesi endpointlerine `responsibleUserId` (veya benzeri) parametresi eklenerek, projenin atanmış kullanıcısına göre filtrelenerek tamamlanacaktır.

## Sayfalama ve Sıralama — Değerlendirildi, Eklenmedi

Hem dashboard hem rapor listesi için mevcut veri hacmi (proje başına birkaç rapor, sistemde onlarca proje) sayfalamayı gerektirmiyor. `List<T>` yanıtını `Page<T>`'ye çevirmek mevcut frontend sözleşmesini (`WeeklyReport[]`, dashboard proje listesi) kırar ve bu aşamada karşılığı olmayan bir karmaşıklık ekler. Bu nedenle T13 kapsamında pagination eklenmedi; ihtiyaç doğduğunda ayrıca ele alınabilir.

## Backend Filtreleme Yöntemi

Projede hiçbir repository'de `@Query` veya `Specification` kullanılmıyor; tüm repository metotları basit türetilmiş (derived) sorgu isimleri. Dashboard filtrelemesi de veritabanı sorgusu değil, önceden çekilen proje listesi üzerinde Java `Stream.filter()` ile yapılıyor.

Bu tutarlılığı bozmamak için rapor listesi filtrelemesi de aynı şekilde kurulacak: mevcut `findByProjectIdOrderByReportWeekStartDesc` sorgusu değişmeden kalacak, yeni filtreler servis katmanında `Stream.filter()` ile uygulanacak. Mevcut veri hacminde bu yaklaşım doğru sonucu üretir; ayrı bir dinamik sorgu altyapısı (Specification) kurmak bu aşamada gereksiz karmaşıklık olur.
