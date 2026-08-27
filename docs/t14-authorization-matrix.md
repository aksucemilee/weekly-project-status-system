# T14 Yetkilendirme Matrisi

Bu doküman, 25-28. gün (T14: Rol bazlı yetki) kapsamında uygulanacak yetkilendirme kurallarını tanımlar. Hem API (endpoint) hem arayüz (ekran/aksiyon) seviyesini kapsar; her kuralın karşısında beklenen yetkisiz davranış da yazılıdır, bu sayede 28. günün test listesi doğrudan bu dokümandan çıkar.

> **Durum:** Bu matris 25. günde tanımlanmış, 26-27. günlerde uygulanmış ve 28. günde test edilmiştir. Aşağıdaki kurallar artık uygulanmış durumdadır; test sonuçları bölüm 10'un sonundadır.

---

## 1. Temel Yaklaşım: Rol Değil, Yetki

Yetkilendirme kontrolleri rol adı üzerinden değil, **yetki (permission)** üzerinden yapılır. Rol, bir yetki demetine verilen isimdir.

```
Kod içinde:  hasAuthority('REPORT_CREATE')     ✔
Kod içinde:  hasRole('PROJE_YONETICISI')       ✘
```

**Gerekçe:** Yetkilendirme kuralı rol adına gömülürse, yeni bir rol eklemek veya bir rolün kapsamını değiştirmek her kontrol noktasına dokunmayı gerektirir. Yetki üzerinden gidildiğinde rol tanımı veriye dönüşür; bu dokümandaki matris doğrudan seed verisinin karşılığı olur ve doküman ile kod zamanla birbirinden kopmaz.

### Rol sayısı kararı

Bir kullanıcının **tek rolü** olur. İstisnai bir ihtiyaç doğarsa kullanıcıya doğrudan ek yetki atanabilir.

**Gerekçe:** "Çoklu rol" ile "doğrudan ek yetki" aynı problemi (istisnai kullanıcı) çözer. Doğrudan yetki daha sadedir, çünkü efektif yetki hesabı tek seviyede kalır: `rolün yetkileri ∪ kullanıcının ek yetkileri`. Çoklu rolde bir yetkinin hangi rolden geldiğini izlemek rol sayısı arttıkça zorlaşır. Ön Analiz'de bir kişinin aynı anda iki rolde olmasını gerektiren senaryo bulunmuyor.

Bu karar, Ön Analiz'deki 1. açık soruyu (*"Aynı kullanıcı birden fazla role sahip olabilir mi?"*) kapatır.

### İki ayrı kontrol ekseni

Yetki tek başına yeterli değildir. Her istekte **iki** kontrol çalışır:

| Eksen | Sorusu | Nasıl çözülür |
| --- | --- | --- |
| **Yetki** | Bu kullanıcı bu tür işlemi yapabilir mi? | Rolün yetki demeti |
| **Kapsam (sahiplik)** | Bu kullanıcı *bu kayıt üzerinde* yapabilir mi? | `ProjectAssignment` → kullanıcının erişebildiği proje id kümesi |

Örnek: Proje yöneticisinin `REPORT_CREATE` yetkisi vardır, ama yalnızca kendisine atanmış projelerde rapor oluşturabilir. Yetki kontrolü geçer, kapsam kontrolü kalırsa istek yine reddedilir.

Yönetmelik bu ikinci ekseni 27. günde ayrıca istiyor ("Proje sahipliği ve 401/403 hata davranışlarını tamamla").

---

## 2. Yetki Listesi

| Yetki | Kapsadığı işlem |
| --- | --- |
| `PROJECT_VIEW` | Proje listeleme ve proje detayı görüntüleme |
| `PROJECT_MANAGE` | Proje oluşturma |
| `REPORT_VIEW` | Haftalık rapor listeleme ve detay görüntüleme |
| `REPORT_CREATE` | Haftalık rapor oluşturma |
| `REPORT_UPDATE` | Haftalık rapor güncelleme *(final denetiminde eklendi, bkz. bölüm 13)* |
| `WORKITEM_VIEW` | İş kalemi listeleme ve detay görüntüleme |
| `WORKITEM_MANAGE` | İş kalemi oluşturma, güncelleme, silme |
| `RISK_VIEW` | Risk/engel listeleme ve detay görüntüleme |
| `RISK_MANAGE` | Risk/engel oluşturma, güncelleme, silme |
| `DASHBOARD_VIEW` | CTO dashboard görüntüleme |
| `USER_MANAGE` | Kullanıcı oluşturma, güncelleme, aktiflik yönetimi |
| `ASSIGNMENT_MANAGE` | Kullanıcının projeye atanması, atamanın güncellenmesi |

---

## 3. Rol → Yetki Demetleri

| Yetki | Proje Yöneticisi | CTO | Admin | Ekip Lideri |
| --- | :---: | :---: | :---: | :---: |
| `PROJECT_VIEW` | ✔ | ✔ | ✔ | ✔ |
| `PROJECT_MANAGE` | – | – | ✔ | – |
| `REPORT_VIEW` | ✔ | ✔ | ✔ | ✔ |
| `REPORT_CREATE` | ✔ | – | – | – |
| `REPORT_UPDATE` | ✔ | – | – | – |
| `WORKITEM_VIEW` | ✔ | ✔ | – | ✔ |
| `WORKITEM_MANAGE` | ✔ | – | – | – |
| `RISK_VIEW` | ✔ | ✔ | – | ✔ |
| `RISK_MANAGE` | ✔ | – | – | – |
| `DASHBOARD_VIEW` | – | ✔ | – | – |
| `USER_MANAGE` | – | – | ✔ | – |
| `ASSIGNMENT_MANAGE` | – | – | ✔ | – |

### Kapsam (hangi projelere erişir)

| Rol | Kapsam |
| --- | --- |
| Proje Yöneticisi | Yalnızca kendisine atanmış projeler |
| Ekip Lideri | Yalnızca kendisine atanmış projeler (salt okunur) |
| CTO | Tüm projeler |
| Admin | Tüm projeler (yönetim amaçlı) |

### Karar gerekçeleri

**CTO salt okunurdur.** Ön Analiz bölüm 3'te "CTO, MVP kapsamında proje ve rapor bilgilerini görüntüler, filtreleme yapar ve proje detaylarını inceler; rapor düzenleme işlemi yapmaz" denmektedir. Bu nedenle CTO'ya hiçbir `*_MANAGE` veya `REPORT_CREATE` yetkisi verilmemiştir.

**Admin rapor oluşturmaz/düzenlemez, yalnızca görüntüler.** Ön Analiz Admin'i "sistemin temel tanımlamalarını ve kullanıcı yönetimini gerçekleştiren rol" olarak tanımlar. Raporlama proje yöneticisinin sorumluluğudur; Admin'e `REPORT_VIEW` verilmesinin nedeni destek/doğrulama ihtiyacıdır. Bu karar Ön Analiz'deki 5. açık soruyu (*"Admin haftalık raporları görüntüleyebilir mi? Düzenleme veya silme yetkisi olacak mı?"*) kapatır: görüntüleyebilir, düzenleyemez/silemez.

**Admin dashboard'a erişmez.** Ön Analiz bölüm 10.7 bunu açık soru olarak bırakmıştı. Rol ayrımını net tutmak için `DASHBOARD_VIEW` yalnızca CTO'ya verilmiştir; dashboard yönetim seviyesinde bir raporlama görünümüdür, sistem yönetimi aracı değildir. Bu aynı zamanda 28. gün için temiz bir 403 senaryosu üretir.

**Ekip Lideri kapsama dahildir, ancak sadeleştirilmiştir.** Yönetmeliğin T14 ortak görevi dört rolün de yetkilerinin netleştirilmesini istiyor. Ön Analiz Ekip Lideri'ni "kendi ekibi veya sorumlu olduğu alanla ilgili iş kalemleri" üzerinden tanımlıyor; ancak projede ekip/alan modeli bulunmuyor ve `WorkItem.responsible` serbest metin bir alan olduğu için "kendi alanı" kavramının veri karşılığı yok. Uydurma bir alan modeli kurmak yerine, Ekip Lideri de diğer roller gibi `ProjectAssignment` üzerinden **projelere** atanır ve atandığı projelerin iş kalemlerini salt okunur görür. Alan bazlı ayrımın proje bazına sadeleştirildiği bilinçli bir kapsam kararıdır. Bu, Ön Analiz'deki 6. açık sorunun T14 ile ilgili kısmını kapatır.

**Yetki demetleri sabit seed verisidir.** Rol-yetki eşlemesini yöneten bir admin ekranı T14 kapsamında geliştirilmez. Admin ekranı kullanıcı ve proje ataması yönetir (Ön Analiz 7.8). Yetki demetlerinin çalışma zamanında düzenlenebilmesi, karşılığı olmayan bir karmaşıklık olur.

---

## 4. Veri Modeli

Mevcut varlıklar: `Project`, `WeeklyReport`, `WorkItem`, `RiskIssue`. T14 ile eklenecekler:

| Varlık | Alanlar | İlişki |
| --- | --- | --- |
| `User` | id, ad, soyad, e-posta (benzersiz), parola (BCrypt hash), aktiflik | `Role` ile N:1 |
| `Role` | id, kod (`PROJE_YONETICISI`, `CTO`, `ADMIN`, `EKIP_LIDERI`) | `Permission` ile M:N |
| `Permission` | id, kod (bkz. bölüm 2) | – |
| `ProjectAssignment` | id, project_id, user_id, atama rolü, aktiflik | `Project` ve `User` ile N:1 |

Opsiyonel: `User` ↔ `Permission` (doğrudan ek yetki). İhtiyaç doğmazsa T14'te oluşturulmaz.

Parolalar **BCrypt** ile hash'lenir; seed kullanıcılarının parolaları da düz metin olarak tutulmaz.

---

## 5. Kimlik Doğrulama Yöntemi

**Karar: Spring Security ile sunucu tarafı oturum (HttpOnly çerez).** JWT tercih edilmemiştir.

**Gerekçe:** JWT'nin klasik SPA kullanımında token `localStorage`'da tutulur ve herhangi bir XSS açığı token'ın çalınmasına yol açar; ayrıca stateless olduğu için logout gerçek bir iptal değildir, token süresi dolana kadar geçerli kalır. JWT'nin asıl getirisi olan sunucuda durum tutmama/yatay ölçekleme, tek instance üzerinde çalışan bu projede karşılık bulmuyor. `HttpOnly` işaretli oturum çerezi JavaScript tarafından okunamaz, dolayısıyla XSS ile çalınamaz ve logout oturumu gerçekten sonlandırır.

Mevcut kurulumla uyumludur: `localhost:5173` ile `localhost:8080` çerez açısından aynı site sayılır (port, site tanımına dahil değildir), bu nedenle `SameSite=Lax` yeterlidir ve `SameSite=None`/HTTPS zorunluluğu doğmaz.

**Gerektirdiği yapılandırma değişiklikleri:**

- `CorsConfig`'e `.allowCredentials(true)` eklenmelidir — şu an tanımlı değil, dolayısıyla çerez hiç gönderilmez.
- Frontend `apiClient` isteklerinde `withCredentials: true` kullanılmalıdır.
- Çerez tabanlı oturumda CSRF koruması gereklidir; Spring Security'nin `CookieCsrfTokenRepository.withHttpOnlyFalse()` deseniyle SPA token'ı okuyup geri gönderir.
- Yeni bağımlılık: `spring-boot-starter-security`.

**Yeniden değerlendirme koşulu:** Frontend ileride backend'den gerçekten farklı bir domain'e deploy edilirse çerez kurulumu zorlaşır; o noktada JWT yeniden değerlendirilmelidir. Mevcut durumda proje doğrulanmış yerel demo üzerinden çalıştırılmaktadır.

---

## 6. Hata Davranışı: 401 mi, 403 mü, 404 mü?

| Durum | Yanıt |
| --- | --- |
| Oturum yok veya süresi dolmuş | `401 Unauthorized` |
| Oturum var, gerekli yetki yok | `403 Forbidden` |
| Oturum ve yetki var, ancak kayıt kullanıcının kapsamı dışında | `403 Forbidden` |
| Kayıt sistemde hiç yok | `404 Not Found` |
| Kullanıcı pasif | `401 Unauthorized` (giriş engellenir) |

Tüm yanıtlar mevcut `GlobalExceptionHandler` üzerinden, projedeki `ApiErrorResponse` formatında döner; istemciye stack trace veya iç teknik detay verilmez.

**Not — kapsam dışı kayıtta 403 yerine 404 tercih edilebilir mi?** Evet; 403 dönmek, kullanıcının erişemediği bir kaydın *var olduğunu* dolaylı olarak açık eder. Bu projede 403 tercih edilmiştir çünkü yönetmelik "kullanıcı oturum açmış olsa da ilgili işleme yetkisi bulunmadığında 403" demektedir ve hata mesajının anlaşılır olması staj kapsamında önceliklidir. Varlık gizleme ihtiyacı doğarsa 404'e geçilebilir.

---

## 7. API Yetkilendirme Matrisi

Kapsam sütunu: **Atanmış** = yalnızca kullanıcının atandığı projeler, **Tümü** = tüm projeler, **–** = kapsam kontrolü uygulanmaz.

> **Otomatik doğrulama:** Bu matrisin temsili bir alt kümesi `AuthorizationMatrixTest` ile teste bağlanmıştır (10 test, dört rol). Bir `@PreAuthorize` anotasyonu yanlışlıkla değiştirilirse test kırmızı yanar; bu, matrisin dokümanla kod arasında kopmasını engeller. Ayrıntı: [`test-raporu.md`](test-raporu.md) bölüm 12.

### Mevcut endpointler

| Endpoint | Gerekli yetki | PY | CTO | Admin | EL | Kapsam | Yetkisiz davranış |
| --- | --- | :-: | :-: | :-: | :-: | --- | --- |
| `GET /api/health` | – (açık) | ✔ | ✔ | ✔ | ✔ | – | – |
| `POST /api/projects` | `PROJECT_MANAGE` | ✘ | ✘ | ✔ | ✘ | – | 401 / 403 |
| `PUT /api/projects/{projectId}` | `PROJECT_MANAGE` | ✘ | ✘ | ✔ | ✘ | – | 401 / 403 / 404 |
| `GET /api/projects` | `PROJECT_VIEW` | ✔ | ✔ | ✔ | ✔ | PY, EL → Atanmış | 401 / 403; kapsam dışı projeler listeye girmez |
| `GET /api/projects/{projectId}` | `PROJECT_VIEW` | ✔ | ✔ | ✔ | ✔ | PY, EL → Atanmış | 401 / 403 |
| `POST /api/projects/{projectId}/weekly-reports` | `REPORT_CREATE` | ✔ | ✘ | ✘ | ✘ | Atanmış | 401 / 403 |
| `GET /api/projects/{projectId}/weekly-reports` | `REPORT_VIEW` | ✔ | ✔ | ✔ | ✔ | PY, EL → Atanmış | 401 / 403 |
| `GET /api/projects/{projectId}/weekly-reports/{weeklyReportId}` | `REPORT_VIEW` | ✔ | ✔ | ✔ | ✔ | PY, EL → Atanmış | 401 / 403 / 404 |
| `PUT /api/projects/{projectId}/weekly-reports/{weeklyReportId}` | `REPORT_UPDATE` | ✔ | ✘ | ✘ | ✘ | Atanmış | 401 / 403 / 404 / 409 |
| `POST /api/weekly-reports/{id}/work-items` | `WORKITEM_MANAGE` | ✔ | ✘ | ✘ | ✘ | Atanmış | 401 / 403 |
| `GET /api/weekly-reports/{id}/work-items` | `WORKITEM_VIEW` | ✔ | ✔ | ✘ | ✔ | PY, EL → Atanmış | 401 / 403 |
| `GET /api/weekly-reports/{id}/work-items/{workItemId}` | `WORKITEM_VIEW` | ✔ | ✔ | ✘ | ✔ | PY, EL → Atanmış | 401 / 403 / 404 |
| `PUT /api/weekly-reports/{id}/work-items/{workItemId}` | `WORKITEM_MANAGE` | ✔ | ✘ | ✘ | ✘ | Atanmış | 401 / 403 |
| `DELETE /api/weekly-reports/{id}/work-items/{workItemId}` | `WORKITEM_MANAGE` | ✔ | ✘ | ✘ | ✘ | Atanmış | 401 / 403 |
| `POST /api/weekly-reports/{id}/risk-issues` | `RISK_MANAGE` | ✔ | ✘ | ✘ | ✘ | Atanmış | 401 / 403 |
| `GET /api/weekly-reports/{id}/risk-issues` | `RISK_VIEW` | ✔ | ✔ | ✘ | ✔ | PY, EL → Atanmış | 401 / 403 |
| `GET /api/weekly-reports/{id}/risk-issues/{riskIssueId}` | `RISK_VIEW` | ✔ | ✔ | ✘ | ✔ | PY, EL → Atanmış | 401 / 403 / 404 |
| `PUT /api/weekly-reports/{id}/risk-issues/{riskIssueId}` | `RISK_MANAGE` | ✔ | ✘ | ✘ | ✘ | Atanmış | 401 / 403 |
| `DELETE /api/weekly-reports/{id}/risk-issues/{riskIssueId}` | `RISK_MANAGE` | ✔ | ✘ | ✘ | ✘ | Atanmış | 401 / 403 |
| `GET /api/dashboard` | `DASHBOARD_VIEW` | ✘ | ✔ | ✘ | ✘ | Tümü | 401 / 403 |

*PY = Proje Yöneticisi, EL = Ekip Lideri*

### T14 ile eklenecek endpointler

| Endpoint | Gerekli yetki | Açıklama |
| --- | --- | --- |
| `POST /api/auth/login` | – (açık) | E-posta + parola ile giriş; oturum çerezi üretir. Hatalı girişte hangi alanın yanlış olduğu açıklanmaz (Ön Analiz 7.1, iş kuralı 4). Pasif kullanıcı giriş yapamaz. |
| `POST /api/auth/logout` | Oturum gerekli | Oturumu sonlandırır. |
| `GET /api/me` | Oturum gerekli | Giriş yapan kullanıcının kimlik, rol ve yetki listesini döner. Frontend ekran/aksiyon görünürlüğünü buna göre kurar. |
| `POST /api/admin/users` | `USER_MANAGE` | E-posta benzersizdir; çakışmada `409 Conflict`. |
| `GET /api/admin/users` | `USER_MANAGE` | |
| `PUT /api/admin/users/{userId}` | `USER_MANAGE` | Aktiflik bilgisi dahil. |
| `POST /api/admin/assignments` | `ASSIGNMENT_MANAGE` | Aynı kullanıcı-proje için ikinci aktif atama engellenir (Ön Analiz 7.8, iş kuralı 4) → `409 Conflict`. |
| `PUT /api/admin/assignments/{assignmentId}` | `ASSIGNMENT_MANAGE` | Atamayı günceller veya pasife alır. |

### Kapsam dışı bırakılanlar

> **Güncelleme notu (final denetimi):** Aşağıdaki ilk iki satır T14 *kapsamı* için geçerliydi ve o hâliyle doğruydu. Rapor ve proje **güncelleme** endpointleri final teslim öncesi kapsam denetiminde eklenmiştir; güncel durum için bölüm 13'e bakınız. **Silme** endpointleri hâlâ yoktur ve bilinçli olarak kapsam dışıdır.

| Konu | Durum |
| --- | --- |
| Haftalık rapor güncelleme/silme | T14 yetkilendirmeye odaklandığı için yeni CRUD endpoint'i eklenmedi. Bu, Ön Analiz'deki 3. açık soruyu (*geçmiş raporlar düzenlenebilir mi*) T14 kapsamında açık bıraktı. **Güncelleme sonradan eklendi (bölüm 13); silme hâlâ yok.** |
| Proje güncelleme/silme | T14'te eklenmedi. **Güncelleme sonradan eklendi (bölüm 13); silme hâlâ yok.** |
| Yetki demetlerinin arayüzden yönetimi | Seed verisi olarak sabittir (bkz. bölüm 3). |
| Kullanıcı silme | Uygulanmadı. Erişim, silme yerine kullanıcının pasife alınmasıyla kapatılır; böylece geçmiş raporlardaki `oluşturan kullanıcı` izleri korunur. |

---

## 8. Arayüz Yetkilendirme Matrisi

### Route erişimi

| Route | Gerekli yetki | PY | CTO | Admin | EL | Yetkisiz davranış |
| --- | --- | :-: | :-: | :-: | :-: | --- |
| `/login` | – (açık) | ✔ | ✔ | ✔ | ✔ | Oturum açıkken erişilirse rolün başlangıç ekranına yönlendirilir |
| `/dashboard` | `DASHBOARD_VIEW` | ✘ | ✔ | ✘ | ✘ | Oturum yoksa `/login`; yetki yoksa erişim reddi ekranı |
| `/projects` | `PROJECT_VIEW` | ✔ | ✔ | ✔ | ✔ | Oturum yoksa `/login` |
| `/reports` | `REPORT_VIEW` | ✔ | ✔ | ✔ | ✔ | Oturum yoksa `/login` |
| `/admin` | `USER_MANAGE` | ✘ | ✘ | ✔ | ✘ | Oturum yoksa `/login`; yetki yoksa erişim reddi ekranı |

### Başlangıç ekranı (login sonrası yönlendirme)

Mevcut kodda `/` ve tanımsız route'lar koşulsuz olarak `/dashboard`'a yönlendiriliyor. Dashboard artık yalnızca CTO'ya açık olacağı için bu yönlendirme **role duyarlı hâle getirilmelidir**; aksi hâlde proje yöneticisi giriş yapar yapmaz erişim reddi ekranıyla karşılaşır.

| Rol | Başlangıç ekranı |
| --- | --- |
| CTO | `/dashboard` |
| Proje Yöneticisi | `/reports` |
| Ekip Lideri | `/reports` |
| Admin | `/admin` |

Ön Analiz 7.1'in kabul kriteri de bunu istiyor: "kullanıcı rolüne uygun başlangıç ekranına yönlendirilir".

### Aksiyon görünürlüğü

| Ekran | Aksiyon | Gerekli yetki | Yetki yoksa |
| --- | --- | --- | --- |
| `/projects` | "+ Yeni proje" butonu | `PROJECT_MANAGE` | Buton gösterilmez |
| `/reports` | "+ Yeni rapor" butonu | `REPORT_CREATE` | Buton gösterilmez |
| `/reports` → Rapor detayı | "Raporu düzenle" butonu | `REPORT_UPDATE` | Buton gösterilmez |
| `/reports` → Rapor detayı | "İş Kalemleri" / "Risk ve Engeller" sekmeleri | `WORKITEM_VIEW` / `RISK_VIEW` | Sekme hiç açılmaz |
| `/projects` | Proje kartındaki "Düzenle" butonu | `PROJECT_MANAGE` | Buton gösterilmez |
| `/reports` → İş Kalemleri | Ekle / Düzenle / Sil | `WORKITEM_MANAGE` | Butonlar gösterilmez, liste salt okunur |
| `/reports` → Risk ve Engeller | Ekle / Düzenle / Sil | `RISK_MANAGE` | Butonlar gösterilmez, liste salt okunur |
| `/admin` | Kullanıcı oluştur/güncelle | `USER_MANAGE` | Ekrana zaten erişilemez |
| `/admin` | Proje ataması | `ASSIGNMENT_MANAGE` | Ekrana zaten erişilemez |

**Önemli ilke:** Arayüzde bir butonun gizlenmesi bir güvenlik kontrolü değildir, yalnızca kullanıcı deneyimidir. Aynı kural backend'de de uygulanmak zorundadır; frontend gizlese bile doğrudan API'ye yapılan istek 403 dönmelidir. 28. günün testleri bunu ayrıca doğrulayacaktır.

---

## 9. T13'ten Devreden Maddelerin Kapanışı

`docs/t13-filter-contract.md` içinde T14'e ertelenmiş iki madde vardı; ikisi de bu matrisin uygulanmasıyla kapanır:

**Sorumlu filtresi.** `ProjectAssignment` modeli kurulduğunda dashboard ve rapor listesi endpointlerine `responsibleUserId` parametresi eklenerek, projenin atanmış kullanıcısına göre filtreleme tamamlanabilir.

**Yetki etkisi.** Kullanıcının erişebildiği proje id kümesi (`allowedProjectIds`), T13'te hazırlanan `WeeklyReportSpecifications.projectIdIn(...)` yapısına tek bir ek predicate olarak bağlanır. `DashboardService.findLatestReportsForProjects` zaten `projectIdIn` kullandığı için aynı predicate doğrudan tekrar kullanılabilir; servis ve controller imzalarını değiştirmeye gerek kalmaz.

Yani kapsam kontrolü, listeleme endpointlerinde ayrı bir filtreleme katmanı olarak değil, mevcut Specification zincirine eklenen bir koşul olarak uygulanır.

---

## 10. 28. Gün Test Listesi

Aşağıdaki senaryolar yukarıdaki matristen türetilmiştir. 28. günde hem API (curl/Swagger) hem tarayıcı üzerinden çalıştırılacaktır.

### Kimlik doğrulama

1. Geçerli e-posta + parola ile giriş → oturum açılır, rolün başlangıç ekranına yönlendirilir.
2. Hatalı parola ile giriş → oturum açılmaz, hangi alanın yanlış olduğu açıklanmayan genel hata mesajı.
3. Pasif kullanıcı ile giriş → erişim engellenir.
4. Oturum açmadan korumalı endpoint'e istek → `401`.
5. Logout sonrası aynı endpoint'e istek → `401`.
6. `GET /api/me` → doğru rol ve yetki listesi döner.

### Yetki kontrolü (permission)

7. CTO `POST /api/projects/{id}/weekly-reports` dener → `403`.
8. Proje yöneticisi `GET /api/dashboard` dener → `403`.
9. Admin `GET /api/dashboard` dener → `403`.
10. Admin `POST /api/projects/{id}/weekly-reports` dener → `403`.
11. Ekip lideri `PUT .../work-items/{id}` dener → `403`.
12. Proje yöneticisi `POST /api/admin/users` dener → `403`.
13. Proje yöneticisi `POST /api/projects` dener → `403`.

### Kapsam kontrolü (sahiplik)

14. Proje yöneticisi, atanmadığı projede rapor oluşturmayı dener → `403`.
15. Proje yöneticisi, atanmadığı projenin rapor listesini ister → `403`.
16. Proje yöneticisi `GET /api/projects` çağırır → yalnızca atandığı projeler döner.
17. Ekip lideri `GET /api/projects` çağırır → yalnızca atandığı projeler döner.
18. CTO `GET /api/projects` çağırır → tüm projeler döner.
19. Proje yöneticisi, atanmadığı projenin raporundaki iş kalemini güncellemeyi dener → `403`.

### Arayüz

20. Proje yöneticisi giriş yapar → `/reports` ekranına düşer, menüde/adres çubuğunda `/dashboard`'a gitmeye çalışırsa erişim reddi görür.
21. Admin giriş yapar → `/admin` ekranına düşer.
22. CTO `/reports` ekranında "+ Yeni rapor" butonunu görmez.
23. CTO iş kalemi ve risk listelerini salt okunur görür (ekle/düzenle/sil butonları yok).
24. Proje yöneticisi `/projects` ekranında "+ Yeni proje" butonunu görmez.
25. Oturumsuz kullanıcı `/reports` adresini açar → `/login`'e yönlendirilir.

### Regresyon (mevcut davranışlar bozulmamalı)

26. Proje yöneticisi kendi projesinde rapor oluşturur → başarılı.
27. Aynı proje ve hafta için ikinci rapor → `409` (mevcut davranış korunuyor).
28. T13 filtreleri (hafta, genel durum, risk, takvim durumu) yetkili kullanıcıda çalışmaya devam eder.
29. T13 sayfalama ve sıralama yetkili kullanıcıda çalışmaya devam eder.
30. Geçersiz `sort` parametresi hâlâ `400` döner.
31. Loading, boş sonuç ve hata durumları bozulmamıştır.

---

## 11. Günlere Dağılım

| Gün | İş | Durum |
| --- | --- | --- |
| 25 | Bu doküman: yetki matrisi, API/UI kuralları, veri modeli ve auth kararı | Tamamlandı |
| 26 | `User`/`Role`/`Permission`/`ProjectAssignment` modeli, Spring Security kurulumu, yetki kontrolleri | Tamamlandı |
| 27 | Proje sahipliği (kapsam) kontrolleri, 401/403 davranışları, arayüz route guard ve aksiyon görünürlüğü | Tamamlandı |
| 28 | Bölüm 10'daki senaryoların uçtan uca çalıştırılması, bulunan hataların düzeltilip tekrar test edilmesi | Tamamlandı |

## 12. Uygulama Sonucu ve Test Kayıtları

### Test sonucu

28. günde 39 senaryo çalıştırıldı: **24 API senaryosu** (curl, oturum çerezi ve CSRF token'ı ile) ve **15 tarayıcı senaryosu** (dört rol için ayrı oturumlarla). Düzeltmeler sonrası tamamı geçti; tarayıcı konsolunda uygulama kaynaklı hata yok (görülen `401` kayıtları, giriş öncesi `/api/me` çağrısının beklenen yanıtıdır).

> **Kanıt notu:** Bu senaryolar geliştirme sırasında elle çalıştırılmıştır; repository'de saklanan, yeniden koşulabilir bir otomatik test paketi (Playwright, Vitest vb.) **bulunmamaktadır**. Sonuçların kaydı bu bölüm ile [`test-raporu.md`](test-raporu.md) bölüm 6'dır. Otomatik test altyapısının kurulması, `test-raporu.md` bölüm 9'da R1 ve R2 olarak kalan risk şeklinde kayıtlıdır.

Admin ekranı arayüze bağlandıktan sonra **14 senaryoluk ek bir tarayıcı turu** daha çalıştırıldı: kullanıcı listeleme, kullanıcı oluşturma, tekrarlı e-posta çakışması (`409` mesajının arayüzde gösterilmesi), atama panelinin açılması, boş durum, atama oluşturma, atamayı pasife alma, düzenlemede e-posta alanının kilitli olması, kullanıcıyı pasife alma, yetkisiz rolün `/admin` erişimi ve **pasife alınan kullanıcının giriş yapamaması**. Tamamı geçti.

### Testte bulunan ve düzeltilen hatalar

| # | Bulgu | Kök neden | Düzeltme |
| --- | --- | --- | --- |
| 1 | Giriş `500` dönüyordu | `changeSessionId()` koşulsuz çağrılıyordu; CSRF token'ı çerez tabanlı olduğu için giriş anında henüz oturum yok ve Tomcat oturumsuz istekte hata fırlatıyor | Oturum varlık kontrolü eklendi; oturum yoksa `saveContext` yenisini oluşturuyor |
| 2 | Hata sunucuda hiç loglanmıyordu | Genel `Exception` fallback'i hatayı yutup `500` dönüyordu | Fallback'e `log.error` eklendi; istemciye hâlâ teknik detay verilmiyor |
| 3 | Tarayıcıdan giriş `403` dönüyordu (API'den çalışırken) | Axios'un yerleşik XSRF desteği yalnızca same-origin isteklerde çalışıyor; `:5173 → :8080` cross-origin olduğu için `X-XSRF-TOKEN` başlığı eklenmiyordu | Token'ı çerezden okuyup başlığa yazan request interceptor eklendi |
| 4 | Çıkış butonunun erişilebilir adı görünen metniyle uyuşmuyordu | MUI `Tooltip` çocuk ögeye `aria-label` ekliyor (WCAG "Label in Name") | Tooltip kaldırıldı; buton metni zaten açık |
| 5 | Başlıktaki e-posta ve çıkış butonu birbirine yapışıktı | `Stack`'in `spacing` prop'u, `flexDirection` `sx` üzerinden verildiği için satır yönünde boşluk üretmiyordu | `gap` kullanıldı |

### Matristen sapmalar

Uygulama sırasında matristen bilinçli olarak sapılan tek nokta, tüm projelere erişim yetkisinin belirlenme biçimidir. Matris bunu rol bazında tanımlıyordu (CTO ve Admin sınırsız). Uygulamada bu, rol adına değil **yetkiye** bağlandı: `DASHBOARD_VIEW` veya `ASSIGNMENT_MANAGE` yetkisine sahip kullanıcı kapsam kısıtına tabi değildir. Sonuç aynı, ancak bu sayede rol adı kodda hiçbir yerde geçmiyor ve dokümanın 1. bölümündeki ilke tutarlı kalıyor.

Bunun dışında tüm kurallar matriste yazıldığı gibi uygulanmıştır.

---

## 13. Final Denetimi Sonrası Eklemeler (26.08.2026)

Final teslim öncesi yapılan kapsam denetiminde, T14'te bilinçli olarak ertelenen iki endpoint MVP kapsamında gerekli bulunarak eklenmiştir. Gerekçeler aşağıdadır.

### 13.1 `PUT .../weekly-reports/{id}` — eklendi

T14'te erteleme gerekçesi "T14 yetkilendirmeye odaklandığı için" idi; bu, kapsam kararı değil sıralama kararıydı. Kaynaklara yeniden bakıldığında güncelleme MVP'de zorunlu çıkmıştır:

- **Yönetmelik bölüm 5.4**, ilk madde: *"proje yöneticisinin yalnızca yetkili olduğu projelerde haftalık rapor **oluşturup güncelleyebildiği** bir akış geliştirin."*
- **Yönetmelik T05, 8. gün / Backend:** *"Listeleme, oluşturma ve **güncelleme** servis/endpointlerini geliştir."*
- **Ön Analiz bölüm 5 (MVP):** *"haftalık rapor oluşturabilmeli ve yetkisi varsa daha sonra **güncelleyebilmelidir**."*
- **Ön Analiz bölüm 7.4:** tam kullanıcı hikâyesi ve üç kabul kriteri.
- **Ön Analiz bölüm 10.3:** ekranın adı zaten *"Haftalık Rapor Oluşturma **ve Düzenleme** Ekranı"*.

**Açık soru 3 neden engel değil:** Ön Analiz bölüm 7.4, iş kuralı 2 açık soruyu daraltıyor: *"Geçmiş raporların **ne kadar süreyle** düzenlenebileceği açık sorudur."* Belirsiz olan **süre sınırı**, güncellemenin varlığı değil. MVP kararı süre sınırı koymamaktır; erişim yalnızca yetki ve kapsam ile sınırlanır. Bu karar bölüm 6'daki hata davranışı tablosunu değiştirmez.

**Neden yeni bir yetki:** `REPORT_CREATE` yeniden kullanılsaydı yetki adı yaptığı işi anlatmaz ve Ön Analiz 7.4'ün *"güncelleme yetkisi bulunan kullanıcı"* ifadesi karşılıksız kalırdı. `REPORT_UPDATE` yalnızca proje yöneticisine verilmiştir: CTO Ön Analiz bölüm 3 gereği salt okunur, Admin ise bu dokümanın 3. bölümünde açık soru 5 kapatılırken "düzenleyemez/silemez" olarak kararlaştırılmıştı.

**İş kuralı:** Rapor haftası, aynı projede başka bir rapora ait haftaya taşınırsa `409 Conflict` döner; raporun kendi haftası çakışma sayılmaz.

### 13.2 `PUT /api/projects/{projectId}` — eklendi

Bu endpoint Ön Analiz bölüm 12.2'de listeli, bölüm 10.8'de ekranı tanımlı, ancak **hiçbir MVP kapsam tanımında ve hiçbir kabul kriterinde yok**. Tek başına bakıldığında B seviyesi bir özelliktir.

Eklenmesinin nedeni işlevsel bir çıkmazdır: `Project.status` ve `Project.active` yalnızca oluşturma anında belirlenebiliyordu. Dashboard "bloke proje" sayacı `status == BLOCKED` üzerinden, aktif proje listesi ise `active` üzerinden hesaplandığı için, bir proje **hiçbir zaman** tamamlandı/bloke olarak işaretlenemiyor ve portföyden çıkarılamıyordu. Admin proje yönetimi akışı (Ön Analiz 7.8) bu hâliyle yarım kalıyordu.

Kapsam dar tutulmuştur: oluşturma ile aynı alanlar, mevcut `PROJECT_MANAGE` yetkisi (yeni yetki eklenmedi), **silme yok**.

### 13.3 Testte bulunan yetkilendirme dışı kusurlar

Denetim sırasında yetkilendirmeyle ilgili iki arayüz kusuru bulunup düzeltilmiştir; ikisi de bu dokümandaki kuralların arayüzde eksik uygulanmasından kaynaklanıyordu:

| Bulgu | Kök neden | Düzeltme |
| --- | --- | --- |
| Marka logosu tüm rollerde `/dashboard`'a gidiyordu; PY, Admin ve EL erişim reddi ekranına düşüyordu | Bölüm 8'deki "başlangıç ekranı" kuralı `AppRoutes` içinde uygulanmış ama `MainLayout`'taki marka bağlantısında uygulanmamıştı | Bağlantı `getLandingPath(user)` kullanacak şekilde düzeltildi |
| Admin, rapor detayında "İş Kalemleri" sekmesini açtığında genel bir hata mesajı görüyordu | Admin'in `WORKITEM_VIEW`/`RISK_VIEW` yetkisi yok (bölüm 3, kasıtlı), ancak sekmeler koşulsuz gösteriliyor ve alt liste `403` alıyordu | Sekmeler ilgili `*_VIEW` yetkisine bağlandı |

### 13.4 Rapor dönemi modeli — Ön Analiz açık soru 8 ve 2 kapatıldı

**Açık soru 8:** *"Rapor dönemi hafta numarasıyla mı, tek bir rapor tarihiyle mi, yoksa başlangıç ve bitiş tarihleriyle mi tutulacaktır?"*

**Karar: tek tarih (`LocalDate`), daima ISO haftasının Pazartesi'si.**

**Bulunan sorun.** Alan `reportWeekStart` adını taşımasına ve sistemin geri kalanının hafta varsaymasına rağmen (dashboard `weekStart .. +6 gün` penceresi, seeder çıktısı, README "güncel hafta" filtresi), kayıt adımı girilen tarihi **olduğu gibi** saklıyordu. Benzersizlik kısıtı da tam tarih üzerindeydi. Sonuç: aynı takvim haftasının iki farklı günü (örn. Pazartesi ve Salı) ayrı dönem sayılıyor ve **aynı haftaya iki rapor girilebiliyordu.** Bu, açık soru 2'nin ("aynı proje ve rapor haftası için yalnızca bir rapor") gerektirdiği kuralın fiilen uygulanamaması demekti; `409` dönüyordu ancak yanlış eksende.

**Neden hafta modeli seçildi.** Yönetmelik bölüm 5.1, 5.2 ve 5.3 dönemi hep "rapor tarihi/haftası" biçiminde, ikisini birlikte yazarak tanımlar; yani modeli açıkça geliştiriciye bırakır. Seçim, işin gerçeğine göre yapılmıştır: yönetmelik bölüm 2.4 CTO'nun görevini "bütün projeleri tek ekranda **karşılaştırma**" olarak tanımlar. Karşılaştırmanın anlamlı olması için tüm projelerin **aynı döneme** ait raporlarının yan yana gelmesi gerekir. Raporun kimliği "hangi hafta" olmalıdır; ne zaman yazıldığı ayrı bir bilgidir (`createdAt`/`updatedAt` zaten tutuluyor). Aksi hâlde bir proje yöneticisinin hafta içinde ikinci bir rapor açması, yönetmelik bölüm 5'te tarif edilen asıl problemi ("aynı bilginin tekrar hazırlanması, güncel tek bir kaynağın oluşmaması") sisteme geri getirirdi.

**Neden validasyon değil normalizasyon.** Kullanıcıdan Pazartesi seçmesini istemek (ve Salı seçerse hata vermek) gereksiz yük olurdu; kullanıcı yanlış bir şey yapmıyor, yalnızca o haftanın raporunu girmek istiyor. Bunun yerine girdi kanonik forma çevrilir. `<input type="week">` daha doğrudan bir arayüz olurdu, ancak tarayıcı desteği ve tip dönüşümü maliyeti MVP'de karşılık bulmadı.

**Uygulama.**

| Yer | Davranış |
| --- | --- |
| `WeeklyReportService.createWeeklyReport` / `updateWeeklyReport` | Girilen tarih `DayOfWeek.MONDAY`'e normalize edilerek saklanır |
| Çakışma kontrolü | Normalize edilmiş hafta üzerinden yapılır → aynı haftanın herhangi bir günü `409` |
| Rapor listesi `weekStart` filtresi | Aynı normalizasyondan geçer; hafta içi bir gün seçilince o haftanın raporu bulunur |
| `DashboardService` | Pencere normalize edilmiş Pazartesi'den başlar; hafta içi gün seçilince pencere kaymaz |
| Arayüz | Tarih alanının altında "Seçilen tarihin bulunduğu haftaya kaydedilir." notu |

**Veri göçü gerekmedi:** mevcut 23 raporun tamamı zaten Pazartesi tarihlidir (SQL ile doğrulandı).

**Bu karar açık soru 2'yi de kapatır:** aynı proje ve hafta için yalnızca bir rapor oluşturulabilir; ikinci kayıt `409 Conflict` ile engellenir.

### 13.5 Model tutarlılığı denetimi — kavram çakışmaları giderildi

Final denetiminin son adımında MVP kendi içinde tutarlılık açısından tarandı. Enum'lar (backend ↔ frontend), yetki kodları ve hafta normalizasyonu tutarlı bulundu; ancak **kavram modelinde altı çakışma** tespit edildi ve kök nedenleri giderildi.

#### 13.5.1 İki ayrı "proje durumu" (T1)

Durum iki yerde tutuluyordu: `Project.status` (admin girer) ve `WeeklyReport.generalStatus` (PM her hafta girer). İkisi de `PLANNED/IN_PROGRESS/COMPLETED/BLOCKED` değerlerini taşıyordu ve **aynı proje için farklı değer gösterebiliyordu** — örneğin proje `IN_PROGRESS` iken son raporu `DELAYED`. Hangisinin doğru olduğu belirsizdi.

**Karar:** iki alan farklı seviyeleri ifade eder ve artık farklı değer kümeleri kullanır.

| Alan | Anlamı | Değerler | Kim yönetir |
| --- | --- | --- | --- |
| `Project.status` | Projenin **yaşam döngüsü** | `PLANNED` / `ACTIVE` / `ON_HOLD` / `CLOSED` | Admin |
| `WeeklyReport.generalStatus` | O **haftanın** çalışma durumu | `PLANNED` / `IN_PROGRESS` / `IN_TEST` / `COMPLETED` / `BLOCKED` | Proje yöneticisi |

Bu, Ön Analiz bölüm 4.1'in proje durumu tarifine ("Başlamadı, Aktif, Askıda veya Kapandı") uygundur.

#### 13.5.2 `generalStatus` üç kavramı birden taşıyordu (T2) — açık soru 7 kapatıldı

Ön Analiz bölüm 10.3 bunu önceden uyarmıştı: *"Genel durum alanındaki nihai seçenekler, Testte/Gecikti/Riskli gibi değerlerin iş kalemi durumu, takvim durumu ve risk seviyesi alanlarıyla **çakışmaması** için açık soruların cevaplarına göre netleştirilecektir."* Bu netleştirme yapılmamıştı: `DELAYED` hem `generalStatus`'ta hem `ScheduleStatus`'ta, `AT_RISK` ise `RiskLevel` ile aynı bilgiyi taşıyordu. Kullanıcı `generalStatus=DELAYED` + `scheduleStatus=ON_TRACK` gibi **mantıksal olarak çelişkili** kayıt oluşturabiliyordu.

**Karar:** `DELAYED` ve `AT_RISK` `generalStatus`'tan kaldırıldı. Üç eksen artık birbirine diktir:

```text
ne yapılıyor  → generalStatus  (PLANNED / IN_PROGRESS / IN_TEST / COMPLETED / BLOCKED)
takvime uyum  → scheduleStatus (ON_TRACK / DELAYED)
risk düzeyi   → riskLevel      (LOW / MEDIUM / HIGH)
```

#### 13.5.3 Sayaç ile sağlık rozeti farklı kaynaktan besleniyordu (T3)

Dashboard'ın "Bloke" sayacı `Project.status == BLOCKED` sayıyordu; tablodaki sağlık rozeti ise raporun durumuna bakıyordu. Sayaç `1` gösterirken tabloda `2` kırmızı rozet olabiliyordu. Ayrıca `Project.status` yalnızca admin elle değiştirdiğinde güncellendiği için, proje yöneticisi haftalarca "bloke" raporu girse bile sayaç artmıyordu.

**Karar:** her ikisi de haftalık rapordan beslenir; yaşam döngüsü alanı dashboard göstergelerine karışmaz.

#### 13.5.4 Risk seviyesi kayıtlı risklerle çelişebiliyordu (T4) — Ön Analiz 7.6 kabul kriteri

`WeeklyReport.riskLevel` formda elle seçiliyordu. Bir raporda çözülmemiş **yüksek** seviyeli beş risk bulunsa bile kullanıcı "Düşük" seçebiliyordu; dashboard kayıtlı riskleri hiç okumuyordu. Bu, Ön Analiz bölüm 7.6'nın kabul kriterini (*"risk rapor altında gösterilir **ve dashboard özetine yansır**"*) karşılamıyordu.

**Karar:** risk seviyesi girdi değil, **türetilmiş** alandır — rapora bağlı `OPEN` ve `ACTION_IN_PROGRESS` durumundaki risk kayıtlarının en yükseğidir; açık risk yoksa `LOW`. Form alanı kaldırıldı.

**Neden hesaplanan değil, saklanan alan:** seviye tamamen sorgu anında hesaplansaydı T13 filtre sözleşmesinin gerektirdiği kolon ortadan kalkar ve risk filtresi Java tarafına kaymak zorunda kalırdı. Kolon korunur, ancak kullanıcı girdisi değildir: `RiskLevelResolver`, risk/engel oluşturma, güncelleme ve silme işlemlerinden sonra yeniden hesaplar.

#### 13.5.5 `GORUNTULEYICI` atama rolü yanlış güvenlik beklentisi yaratıyordu (T5)

`AssignmentRole` üç değer taşıyordu ama **hiçbir kod yolu bu alanı okumuyordu**; kapsam kontrolü yalnızca atamanın varlığına bakar. Yani "görüntüleyici olarak atanmış" bir kullanıcı, rolünün tüm yetkileriyle işlem yapıyordu.

**Karar:** `GORUNTULEYICI` kaldırıldı. Alanın yetki belirlemediği, yalnızca raporlama/görünürlük amaçlı olduğu enum belgesinde açıkça yazıldı. Bu, bölüm 1'deki "rol değil, yetki" ilkesiyle tutarlıdır.

#### 13.5.6 Pasif projeye rapor girilebiliyordu (T6)

Pasif proje portföyden çıkarılır ve dashboard'da listelenmez, ancak ona yeni haftalık rapor eklenebiliyordu. Artık `400` ile engellenir.

#### Kapsam dışı bırakılanlar

| Konu | Karar |
| --- | --- |
| `actualProgress > targetProgress` engellensin mi | **Hayır.** Planın önünde giden proje için meşru bir durumdur; kural koymak gerçek senaryoyu bloke ederdi |
| Gelecek haftaya rapor girilebilsin mi | Ön Analiz bölüm 14, açık soru 9 cevapsız. Proje yöneticisinin gelecek hafta planını önceden girmesi meşru olduğu için sınır konmadı |

#### Veri etkisi

Enum değişiklikleri H8'de kayıtlı `CHECK` constraint sorununu tetiklediği için tablolar düşürülüp şema ve demo verisi sıfırdan üretildi. Demo verisi artık uygulamanın kendi kuralından geçer: seeder raporları varsayılan risk seviyesiyle oluşturur, risk kayıtlarını ekler, ardından seviyeleri `RiskLevelResolver` ile yeniden hesaplar.

### 13.6 Kapsam dışında bırakılmaya devam edenler

| Konu | Gerekçe |
| --- | --- |
| `DELETE` (rapor ve proje) | Ön Analiz 12.3 "MVP dışında bırakılabilir" diyor; bölüm 14, açık soru 3 cevaplanmadı |
| Kullanıcı silme | Bölüm 7'deki gerekçe geçerliliğini koruyor |
| Yetki demetlerinin arayüzden yönetimi | Bölüm 3'teki gerekçe geçerliliğini koruyor |
| `responsibleUserId` filtresi | Sorumlu bilgisi artık **gösteriliyor**, ancak filtre parametresi eklenmedi; MVP filtre beklentisi (yönetmelik 5.2: proje, hafta, durum, risk) zaten karşılanıyor |
