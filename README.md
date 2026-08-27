# Haftalık Proje Durum Raporlama ve CTO Takip Sistemi

Kolaysoft staj projesi kapsamında geliştirilen Full Stack web uygulamasıdır.

Projenin amacı, proje yöneticilerinin haftalık proje durumlarını standart bir yapıda raporlayabilmesini ve CTO'nun farklı projelerin ilerleme, durum, takvim, risk ve aktif iş bilgilerini tek bir ekran üzerinden takip edebilmesini sağlamaktır.

Sistem kapsamında proje ve haftalık rapor yönetiminin yanında iş kalemleri, risk/engel kayıtları ve filtrelenebilir bir CTO dashboard yapısı geliştirilmektedir.

---

## Projenin Temel Özellikleri

Mevcut sürümde aşağıdaki temel akışlar bulunmaktadır:

- Proje oluşturma, listeleme ve güncelleme
- Proje detayını görüntüleme
- Haftalık proje durum raporu oluşturma, listeleme ve güncelleme
- Haftalık rapor detayını görüntüleme
- Haftalık raporlara bağlı iş kalemlerini yönetme
- Haftalık raporlara bağlı risk ve engel kayıtlarını yönetme
- CTO dashboard üzerinden proje durumlarını toplu görüntüleme
- Dashboard üzerinde proje, hafta, genel durum ve risk seviyesine göre filtreleme
- Form ve API validasyonları
- Merkezi backend hata yönetimi
- Frontend loading, empty ve error durumları
- Backend, frontend ve PostgreSQL arasında uçtan uca veri akışı

---

## Kullanılan Teknolojiler

### Backend

- Java 21
- Spring Boot 4.1.0
- Spring Web MVC
- Spring Data JPA
- Spring Security
- Bean Validation
- PostgreSQL
- Swagger / OpenAPI
- springdoc-openapi
- Maven

### Frontend

- React 19
- TypeScript 6
- Vite 8
- React Router
- Material UI
- Axios
- ESLint

### Veritabanı

- PostgreSQL

### Teknik Karar Notu

Backend için Java + Spring Boot, frontend için React; Kolaysoft staj yönetmeliğinde önerilen teknolojiler olduğu ve ekip içinde en yaygın kullanılan yığın olduğu için tercih edilmiştir. Veritabanı olarak PostgreSQL, Spring Data JPA ile doğrudan uyumlu, ilişkisel ve açık kaynak olması nedeniyle seçilmiştir. API dokümantasyonu için springdoc-openapi (Swagger UI) kullanılmıştır; bu sayede backend endpointleri ayrı bir Postman koleksiyonu tutmaya gerek kalmadan doğrudan tarayıcı üzerinden incelenip test edilebilmektedir.

---

## Proje Yapısı

Repository'nin temel yapısı aşağıdaki şekildedir:

```text
weekly-project-status-system/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   ├── t13-filter-contract.md
│   ├── t14-authorization-matrix.md
│   ├── test-raporu.md
│   └── ai-kullanim-ozeti.md
│
├── .gitignore
└── README.md
```

### Teslim Dokümanları

| Doküman | İçerik |
| --- | --- |
| [`docs/t13-filter-contract.md`](docs/t13-filter-contract.md) | Filtre sözleşmesi, sayfalama/sıralama kuralları ve backend filtreleme yönteminin gerekçesi |
| [`docs/t14-authorization-matrix.md`](docs/t14-authorization-matrix.md) | Rol/yetki matrisi, kimlik doğrulama kararı, API ve arayüz yetkilendirme kuralları, yetki test senaryoları |
| [`docs/test-raporu.md`](docs/test-raporu.md) | Konsolide test kanıtı: senaryolar, hata kayıtları, tekrar test sonuçları ve kalan riskler |
| [`docs/ai-kullanim-ozeti.md`](docs/ai-kullanim-ozeti.md) | Yapay zekânın nerede, ne amaçla kullanıldığı ve çıktının nasıl doğrulandığı |

Backend tarafında temel olarak katmanlı mimari kullanılmaktadır:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

API üzerinden veri alışverişinde Entity nesnelerinin doğrudan kullanılmaması için request ve response DTO yapıları kullanılmaktadır.

Frontend tarafında yapı; API client, component, page, service, type, route, layout ve tema sorumluluklarına ayrılmıştır.

---

## Gereksinimler

Projeyi yerel ortamda çalıştırmak için aşağıdaki araçların kurulu olması gerekir:

- Java 21
- Node.js
- npm
- PostgreSQL
- Git

Maven Wrapper backend projesinde bulunduğu için ayrıca Maven kurulması zorunlu değildir.

---

# Kurulum ve Çalıştırma

## 1. Repository'yi Klonlama

```bash
git clone https://github.com/aksucemilee/weekly-project-status-system.git
cd weekly-project-status-system
```

---

## 2. PostgreSQL Veritabanını Hazırlama

Projede PostgreSQL kullanılmaktadır.

Varsayılan bağlantı bilgileri:

```text
Host: localhost
Port: 5432
Database: weekly_project_status
Username: postgres
```

Veritabanını oluşturmak için PostgreSQL üzerinde aşağıdaki SQL komutu çalıştırılabilir:

```sql
CREATE DATABASE weekly_project_status;
```

Backend yapılandırmasında veritabanı bilgileri ortam değişkenleri üzerinden alınmaktadır.

Kullanılan değişkenler:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JPA_DDL_AUTO
SEED_USER_PASSWORD
SEED_DEMO_DATA
```

Varsayılan değerler:

```text
DB_URL=jdbc:postgresql://localhost:5432/weekly_project_status
DB_USERNAME=postgres
JPA_DDL_AUTO=update
```

`DB_PASSWORD` için varsayılan bir parola bulunmamaktadır ve yerel ortamda tanımlanması gerekir.

`SEED_USER_PASSWORD`, demo kullanıcılarının parolasının **son ekini** belirler. Bu değişken tanımlı değilse demo kullanıcıları **oluşturulmaz** ve sisteme giriş yapılamaz; uygulama başlangıçta bunu uyarı olarak loglar.

Her demo kullanıcısının parolası şu desenle üretilir:

```text
parola = <e-posta yerel kısmı> + SEED_USER_PASSWORD
```

Böylece her rolün demo sırasında akılda kalan ayrı bir parolası olur, ancak parolanın gizli kısmı kaynak kodda tutulmaz (yönetmelik bölüm 8.2). Örneğin:

```powershell
$env:SEED_USER_PASSWORD='1234!'
```

Tanımlandığında aşağıdaki demo kullanıcıları oluşturulur ve proje yöneticisi ile ekip liderine örnek proje ataması yapılır:

| E-posta | Ad Soyad | Rol | Yukarıdaki örnekle parola |
| --- | --- | --- | --- |
| `pm@demo.local` | Elif Demir | Proje Yöneticisi | `pm1234!` |
| `cto@demo.local` | Murat Yılmaz | CTO | `cto1234!` |
| `admin@demo.local` | Sistem Yöneticisi | Admin | `admin1234!` |
| `lider@demo.local` | Burak Kaya | Ekip Lideri | `lider1234!` |

Kullanıcı adları gerçek kişi verisi değildir; müşteri adları gibi tamamı demo amaçlı üretilmiştir.

> **Mevcut veritabanı notu:** Seeder idempotenttir ve **var olan kullanıcıyı güncellemez**. Daha önce oluşturulmuş bir veritabanında ad veya parola deseni değiştiğinde kayıtlar kendiliğinden güncellenmez; kullanıcıları silip uygulamayı yeniden başlatmak (`DELETE FROM project_assignments; DELETE FROM users;`) veya ilgili satırları elle güncellemek gerekir.

### Demo / Sunum Verisi

`SEED_DEMO_DATA=true` tanımlandığında uygulama açılışta örnek proje, haftalık rapor, iş kalemi, risk/engel ve proje ataması kayıtları oluşturur:

```powershell
$env:SEED_DEMO_DATA='true'
```

Veri seti, geliştirilen özelliklerin demo sırasında görünür olması için tasarlanmıştır:

| Özellik | Demo verisindeki karşılığı |
| --- | --- |
| Rapor listesi sayfalaması | `e-Fatura Entegrasyon Modülü` projesinde 12 haftalık rapor bulunur; sayfa boyutu 10 olduğu için liste 2 sayfaya bölünür |
| Dashboard sayaçları | 6 aktif proje; 2 yüksek riskli, 2 geciken ve 1 bloke proje |
| Dashboard ve rapor filtreleri | Yedi farklı genel durum (`PLANNED`, `IN_PROGRESS`, `IN_TEST`, `COMPLETED`, `DELAYED`, `AT_RISK`, `BLOCKED`), üç risk seviyesi ve iki takvim durumu |
| Aktif iş sayacı | `IN_PROGRESS`, `IN_TEST` ve `BLOCKED` durumunda iş kalemleri |
| Rol bazlı kapsam | Proje yöneticisi 3, ekip lideri 2, CTO ise 6 projenin tamamını görür |
| Boş durum davranışı | Tamamlanmış proje güncel hafta için rapor içermez; dashboard bunu "rapor bekleniyor" olarak gösterir |

Rapor haftaları uygulamanın çalıştırıldığı tarihe göre hesaplanır; bu nedenle veri ne zaman yüklenirse yüklensin en güncel raporlar dashboard'un varsayılan "güncel hafta" filtresine düşer.

Seeder **idempotent**tir: veritabanında zaten proje kaydı varsa hiçbir şey oluşturmaz, dolayısıyla uygulama her açıldığında veri çoğalmaz. Demo verisini sıfırlamak için ilgili tablolar temizlenip uygulama yeniden başlatılmalıdır.

Kullanılan müşteri adları gerçek müşteri verisi değildir; tamamı demo amaçlı üretilmiştir.

### PowerShell

```powershell
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
```

Farklı PostgreSQL bağlantı bilgileri kullanılacaksa:

```powershell
$env:DB_URL='jdbc:postgresql://localhost:5432/weekly_project_status'
$env:DB_USERNAME='POSTGRESQL_KULLANICI_ADINIZ'
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
```

İstenirse JPA davranışı da ortam değişkeni üzerinden değiştirilebilir:

```powershell
$env:JPA_DDL_AUTO='update'
```

Geliştirme ortamında `JPA_DDL_AUTO` belirtilmezse varsayılan olarak `update` kullanılır.

Gerçek veritabanı parolaları veya diğer gizli bilgiler repository'ye eklenmemelidir.

---

## 3. Backend'i Çalıştırma

### Windows / PowerShell

Projenin ana klasöründen:

```powershell
cd backend
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
.\mvnw.cmd spring-boot:run
```

### macOS / Linux

```bash
cd backend
export DB_PASSWORD='POSTGRESQL_PAROLANIZ'
./mvnw spring-boot:run
```

Backend varsayılan olarak:

```text
http://localhost:8080
```

adresinde çalışır.

### Health Kontrolü

```text
http://localhost:8080/api/health
```

Backend başarılı şekilde çalışıyorsa health endpointinden servis durumunun erişilebilir olması beklenir.

### Swagger / OpenAPI

Swagger arayüzü:

```text
http://localhost:8080/swagger-ui/index.html
```

Swagger üzerinden backend endpointleri incelenebilir ve API istekleri doğrudan test edilebilir.

---

## 4. CORS Yapılandırması

Backend, `/api/**` altındaki tüm endpointler için CORS izinlerini `CorsConfig` sınıfı üzerinden tanımlar.

Varsayılan yapılandırma:

```text
allowedOrigins : http://localhost:5173
allowedMethods : GET, POST, PUT, PATCH, DELETE, OPTIONS
allowedHeaders : *
```

Bu yapılandırma, frontend'in varsayılan Vite geliştirme portu (`5173`) ile birebir uyumludur; standart `npm run dev` ile çalıştırıldığında ek bir işlem gerekmez.

Frontend farklı bir portta veya farklı bir origin üzerinden çalıştırılırsa (örneğin `5173` portu meşgulse Vite otomatik olarak `5174` gibi başka bir porta geçer), backend bu isteği CORS hatasıyla reddeder. Bu durumda `backend/src/main/java/com/kolaysoft/weeklyprojectstatus/config/CorsConfig.java` dosyasındaki `allowedOrigins` değeri, frontend'in gerçekte çalıştığı adresle güncellenmelidir.

Tarayıcı konsolunda `CORS policy` veya `No 'Access-Control-Allow-Origin' header` şeklinde bir hata görülmesi, genellikle frontend portunun `CorsConfig` içindeki izinli origin ile eşleşmediğini gösterir.

---

## 5. Frontend Yapılandırması

Frontend'in backend API'ye bağlanabilmesi için `frontend/.env.local` dosyası oluşturulabilir.

İçeriği:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Repository içerisinde örnek yapılandırma dosyası bulunmaktadır:

```text
frontend/.env.example
```

`.env.local` yalnızca yerel ortamda tutulmalı ve repository'ye eklenmemelidir.

Backend farklı bir adres veya port üzerinden çalıştırılırsa `VITE_API_BASE_URL` buna göre güncellenmelidir.

---

## 6. Frontend'i Çalıştırma

Yeni bir terminal açılarak projenin ana klasöründen:

```powershell
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak:

```text
http://localhost:5173
```

adresinde çalışır.

---

# Frontend Sayfaları

Uygulamada mevcut temel route yapısı aşağıdaki şekildedir:

| Route        | Açıklama                    | Gerekli yetki     |
| ------------ | --------------------------- | ----------------- |
| `/login`     | Giriş ekranı                | -                 |
| `/dashboard` | CTO proje durum dashboard'u | `DASHBOARD_VIEW`  |
| `/projects`  | Proje yönetimi              | `PROJECT_VIEW`    |
| `/reports`   | Haftalık rapor yönetimi     | `REPORT_VIEW`     |
| `/admin`     | Admin ekranı                | `USER_MANAGE`     |

Oturum açılmamışsa korumalı route'lar `/login` sayfasına yönlendirir. Oturum var ancak gerekli yetki yoksa yönlendirme yapılmaz, erişim reddi mesajı gösterilir.

Ana adres `/` kullanıcının rolüne uygun başlangıç ekranına yönlendirir: CTO için `/dashboard`, admin için `/admin`, proje yöneticisi ve ekip lideri için `/reports`.

---

# Backend API

Tüm temel backend endpointleri `/api` altında çalışmaktadır.

Swagger arayüzü mevcut API sözleşmesini incelemek ve test etmek için kullanılabilir.

## Health

| Metot | Endpoint      | Açıklama                             |
| ----- | ------------- | ------------------------------------ |
| `GET` | `/api/health` | Backend servis durumunu kontrol eder |

---

## Auth

| Metot  | Endpoint            | Açıklama                                                | Gerekli yetki |
| ------ | ------------------- | ------------------------------------------------------- | ------------- |
| `POST` | `/api/auth/login`   | E-posta ve parola ile giriş yapar, oturum çerezi üretir  | -             |
| `POST` | `/api/auth/logout`  | Oturumu sonlandırır                                     | Oturum        |
| `GET`  | `/api/me`           | Giriş yapan kullanıcının kimlik, rol ve yetki listesi    | Oturum        |

Hatalı girişte hangi alanın yanlış olduğu açıklanmaz; kullanıcının bulunamaması, parolanın yanlış olması ve kullanıcının pasif olması aynı genel mesajla `401` döner.

Oturum sunucu tarafında tutulur ve `HttpOnly` çerez ile taşınır. Çerez tabanlı oturum kullanıldığı için CSRF koruması açıktır: `POST`, `PUT` ve `DELETE` istekleri `X-XSRF-TOKEN` başlığı bekler. Token, herhangi bir `GET` isteğinden sonra `XSRF-TOKEN` çerezine yazılır.

---

## Admin

| Metot  | Endpoint                             | Açıklama                          | Gerekli yetki       |
| ------ | ------------------------------------ | --------------------------------- | ------------------- |
| `POST` | `/api/admin/users`                   | Kullanıcı oluşturur               | `USER_MANAGE`       |
| `GET`  | `/api/admin/users`                   | Kullanıcıları listeler            | `USER_MANAGE`       |
| `PUT`  | `/api/admin/users/{userId}`          | Kullanıcı ve aktiflik bilgilerini günceller | `USER_MANAGE` |
| `POST` | `/api/admin/assignments`             | Kullanıcıyı projeye atar          | `ASSIGNMENT_MANAGE` |
| `GET`  | `/api/admin/assignments?userId=`     | Kullanıcının atamalarını listeler | `ASSIGNMENT_MANAGE` |
| `PUT`  | `/api/admin/assignments/{id}`        | Atamayı günceller veya pasife alır | `ASSIGNMENT_MANAGE` |

Parola veya parola hash'i hiçbir yanıtta dönmez. Aynı kullanıcı-proje ikilisi için ikinci bir aktif atama `409 Conflict` ile engellenir.

---

## Project

| Metot  | Endpoint                    | Açıklama                             | Gerekli yetki    |
| ------ | --------------------------- | ------------------------------------ | ---------------- |
| `POST` | `/api/projects`             | Yeni proje oluşturur                 | `PROJECT_MANAGE` |
| `GET`  | `/api/projects`             | Kullanıcının kapsamındaki projeleri listeler | `PROJECT_VIEW` |
| `GET`  | `/api/projects/{projectId}` | Belirtilen projenin detayını getirir | `PROJECT_VIEW`   |
| `PUT`  | `/api/projects/{projectId}` | Proje temel bilgilerini, durumunu ve portföy aktifliğini günceller | `PROJECT_MANAGE` |

Proje yanıtlarında `responsibleManager` alanı, projeye `PROJE_YONETICISI` sıfatıyla atanmış aktif kullanıcının adını taşır; atama yoksa `null` döner.

Proje güncellemede `status` ve `active` alanları zorunludur. `active=false` yapılan proje CTO dashboard'unda listelenmez; kayıt silinmediği için geçmiş raporları korunur.

---

## Weekly Report

| Metot  | Endpoint                                                    | Açıklama                                     | Gerekli yetki   |
| ------ | ----------------------------------------------------------- | -------------------------------------------- | --------------- |
| `POST` | `/api/projects/{projectId}/weekly-reports`                  | Projeye haftalık rapor oluşturur             | `REPORT_CREATE` |
| `GET`  | `/api/projects/{projectId}/weekly-reports`                  | Projeye ait haftalık raporları listeler      | `REPORT_VIEW`   |
| `GET`  | `/api/projects/{projectId}/weekly-reports/{weeklyReportId}` | Belirtilen haftalık raporun detayını getirir | `REPORT_VIEW`   |
| `PUT`  | `/api/projects/{projectId}/weekly-reports/{weeklyReportId}` | Haftalık raporu günceller                    | `REPORT_UPDATE` |

Güncellemede oluşturma ile aynı validasyon kuralları uygulanır. Rapor haftası, aynı projede başka bir rapora ait bir haftaya taşınırsa istek `409 Conflict` ile reddedilir; raporun kendi haftası çakışma sayılmaz. Düzenleme için bir süre sınırı yoktur: erişim yalnızca `REPORT_UPDATE` yetkisi ve proje ataması (kapsam) ile sınırlanır.

### Rapor dönemi: hafta modeli

`reportWeekStart` bir **dönemi** temsil eder, tek bir günü değil. Gönderilen tarih, ait olduğu ISO haftasının **Pazartesi**'sine normalize edilerek saklanır:

```text
gönderilen 2026-07-15 (Çarşamba)  →  kaydedilen 2026-07-13 (Pazartesi)
```

Bu kural oluşturma, güncelleme, rapor listesi `weekStart` filtresi ve dashboard hafta penceresinde aynı şekilde uygulanır. Sonuçları:

- **Aynı proje ve hafta için yalnızca bir rapor** oluşturulabilir; aynı haftanın herhangi bir günü gönderilse de ikinci kayıt `409 Conflict` alır.
- Filtrede hafta içi bir gün seçilince o haftanın raporu bulunur.
- Dashboard'da hafta içi bir gün seçilince pencere kaymaz.

Kullanıcıdan Pazartesi seçmesi istenmez; arayüz tarih alanının altında "Seçilen tarihin bulunduğu haftaya kaydedilir." notunu gösterir. Bu karar Ön Analiz bölüm 14'teki 8. ve 2. açık soruları kapatır; gerekçesi [`docs/t14-authorization-matrix.md`](docs/t14-authorization-matrix.md) bölüm 13.4'tedir.

Rapor listeleme isteği aşağıdaki isteğe bağlı filtre, sayfalama ve sıralama parametrelerini destekler:

| Parametre       | Açıklama                                                              |
| --------------- | ---------------------------------------------------------------------- |
| `weekStart`     | Rapor haftasına göre filtreleme; gönderilen tarih haftanın Pazartesi'sine normalize edilir |
| `generalStatus` | Genel duruma göre filtreleme                                          |
| `riskLevel`     | Risk seviyesine göre filtreleme                                       |
| `scheduleStatus`| Takvim durumuna (gecikme) göre filtreleme                             |
| `page`          | Sayfa numarası (0 tabanlı), varsayılan `0`                            |
| `size`          | Sayfa boyutu, varsayılan `20`                                         |
| `sort`          | `alan,yön` biçiminde sıralama (`reportWeekStart`, `targetProgress`, `actualProgress`; `asc`/`desc`), varsayılan `reportWeekStart,desc` |

Filtreleme ve sıralama Spring Data JPA `Specification` ile veritabanı seviyesinde uygulanır; yanıt gövdesi düz bir dizi değil, sayfalanmış bir yapıdır:

```json
{
  "content": [ /* haftalık rapor listesi */ ],
  "page": 0,
  "size": 20,
  "totalElements": 4,
  "totalPages": 1
}
```

Geçersiz bir `sort` alanı veya yönü gönderilirse `400 Bad Request` döner. Detaylar için [`docs/t13-filter-contract.md`](docs/t13-filter-contract.md) dosyasına bakınız.

---

## Work Item

| Metot    | Endpoint                                                       | Açıklama                           |
| -------- | -------------------------------------------------------------- | ---------------------------------- |
| `POST`   | `/api/weekly-reports/{weeklyReportId}/work-items`              | İş kalemi oluşturur                |
| `GET`    | `/api/weekly-reports/{weeklyReportId}/work-items`              | Rapora ait iş kalemlerini listeler |
| `GET`    | `/api/weekly-reports/{weeklyReportId}/work-items/{workItemId}` | İş kalemi detayını getirir         |
| `PUT`    | `/api/weekly-reports/{weeklyReportId}/work-items/{workItemId}` | İş kalemini günceller              |
| `DELETE` | `/api/weekly-reports/{weeklyReportId}/work-items/{workItemId}` | İş kalemini siler                  |

---

## Risk / Issue

| Metot    | Endpoint                                                         | Açıklama                                   |
| -------- | ---------------------------------------------------------------- | ------------------------------------------ |
| `POST`   | `/api/weekly-reports/{weeklyReportId}/risk-issues`               | Risk veya engel kaydı oluşturur            |
| `GET`    | `/api/weekly-reports/{weeklyReportId}/risk-issues`               | Rapora ait risk/engel kayıtlarını listeler |
| `GET`    | `/api/weekly-reports/{weeklyReportId}/risk-issues/{riskIssueId}` | Risk/engel detayını getirir                |
| `PUT`    | `/api/weekly-reports/{weeklyReportId}/risk-issues/{riskIssueId}` | Risk/engel kaydını günceller               |
| `DELETE` | `/api/weekly-reports/{weeklyReportId}/risk-issues/{riskIssueId}` | Risk/engel kaydını siler                   |

---

## CTO Dashboard

| Metot | Endpoint         | Açıklama                                           |
| ----- | ---------------- | -------------------------------------------------- |
| `GET` | `/api/dashboard` | CTO dashboard özetini ve proje durumlarını getirir |

Dashboard aşağıdaki isteğe bağlı filtre parametrelerini desteklemektedir:

| Parametre        | Açıklama                              |
| ---------------- | -------------------------------------- |
| `weekStart`      | Rapor haftasına göre filtreleme (pencere: `weekStart` .. `weekStart + 6 gün`) |
| `projectId`      | Projeye göre filtreleme               |
| `generalStatus`  | Genel proje durumuna göre filtreleme  |
| `riskLevel`      | Risk seviyesine göre filtreleme       |
| `scheduleStatus` | Takvim durumuna (gecikme) göre filtreleme |

Örnek istek:

```http
GET /api/dashboard?weekStart=2026-08-03&riskLevel=HIGH
```

Filtreler birlikte veya ayrı ayrı kullanılabilir.

---

# Uygulama Özellikleri

## Proje Yönetimi

Proje yönetimi kapsamında:

- Yeni proje oluşturulabilir.
- Projeler listelenebilir.
- Proje detayları backend üzerinden görüntülenebilir.
- `PROJECT_MANAGE` yetkisi olan kullanıcı (Admin) proje adı, müşteri, açıklama, tarihler, proje durumu ve portföy aktifliğini güncelleyebilir.
- Proje listesinde her projenin sorumlu proje yöneticisi gösterilir; atama yoksa "Atanmadı" yazar.
- Proje oluşturma ve güncelleme sırasında oluşan API hataları frontend üzerinde kullanıcıya gösterilir.
- Listeleme sırasında loading, empty ve error durumları yönetilir.

Proje durumu ve aktifliğinin güncellenebilmesi, CTO dashboard'undaki "bloke proje" sayacının ve aktif proje listesinin gerçekten yönetilebilmesini sağlar; bu iki alan yalnızca oluşturma anında belirlenebilseydi bir proje tamamlandı/bloke olarak işaretlenemez ve portföyden çıkarılamazdı.

---

## Haftalık Rapor Yönetimi

Her proje için haftalık durum raporu oluşturulabilir.

Haftalık raporlarda temel olarak aşağıdaki bilgiler tutulmaktadır:

- Rapor haftası
- Hedeflenen ilerleme
- Gerçekleşen ilerleme
- Genel durum
- Takvim durumu
- Risk seviyesi
- Yapılan işler
- Gelecek hafta yapılacaklar
- Engeller
- Genel durum notu

Seçilen projeye ait geçmiş haftalık raporlar listelenebilir ve rapor detayları görüntülenebilir. Rapor listesi; hafta, genel durum, risk seviyesi ve takvim durumuna göre filtrelenebilir. Bu filtreler seçim yapıldığı anda uygulanır (Dashboard'daki "Uygula" adımının aksine); "Temizle" ile sıfırlanır.

`REPORT_UPDATE` yetkisi olan kullanıcı (proje yöneticisi), rapor detayındaki "Raporu düzenle" aksiyonuyla mevcut bir raporu güncelleyebilir. Form aynı validasyon kurallarıyla mevcut değerler dolu olarak açılır. Düzenleme için süre sınırı bulunmaz; kullanıcı yalnızca atandığı projelerin raporlarını düzenleyebilir. CTO ve Admin bu aksiyonu görmez ve doğrudan API isteği gönderirlerse `403` alırlar.

---

## İş Kalemi Yönetimi

Her haftalık rapora bağlı iş kalemleri oluşturulabilir.

İş kalemleri için:

- Oluşturma
- Listeleme
- Detay görüntüleme
- Güncelleme
- Silme

işlemleri desteklenmektedir.

İş kalemlerinde başlık, açıklama, sorumlu bilgisi, durum ve tarih bilgileri yönetilmektedir.

Planlanan ve tamamlanan tarihlerin tutarlılığı için backend tarafında iş kuralları uygulanmaktadır.

---

## Risk ve Engel Yönetimi

Haftalık raporlara bağlı risk ve engel kayıtları yönetilebilmektedir.

Risk/engel kayıtları için:

- Oluşturma
- Listeleme
- Detay görüntüleme
- Güncelleme
- Silme

işlemleri desteklenmektedir.

Bu kayıtlar rapor ekranının yanında CTO dashboard detay görünümünde de kullanılmaktadır.

---

## CTO Dashboard

CTO dashboard, projelerin güncel haftalık durumlarını tek ekranda karşılaştırabilmek amacıyla geliştirilmiştir.

Dashboard üzerinde:

- Portföy özet kartları
- Proje durum tablosu (proje, müşteri, sorumlu proje yöneticisi)
- Proje ve rapor detay görünümü
- İş kalemi bilgileri
- Risk ve engel bilgileri
- Hafta filtresi
- Proje filtresi
- Genel durum filtresi
- Risk seviyesi filtresi
- Takvim durumu (gecikme) filtresi
- Loading durumu
- Empty durumu
- Error durumu

bulunmaktadır.

Dashboard verileri backend API üzerinden alınmaktadır. Proje tablosundaki aktif iş sayısı, o projenin son haftalık raporuna bağlı iş kalemlerinden `IN_PROGRESS`, `IN_TEST` veya `BLOCKED` durumunda olanlar sayılarak backend tarafında hesaplanır; ayrıca girilen bir alan değildir.

---

# Validasyon ve Hata Yönetimi

## Proje Validasyonları

Proje oluşturulurken backend tarafında aşağıdaki kontroller uygulanmaktadır:

- Proje adı zorunludur ve boş/whitespace değer kabul edilmez.
- Proje adı en fazla 150 karakter olabilir.
- Müşteri adı zorunludur ve boş/whitespace değer kabul edilmez.
- Müşteri adı en fazla 150 karakter olabilir.

Bu kontroller `ProjectCreateRequest` içinde Bean Validation ile tanımlanmış olup `ProjectController` üzerinde `@Valid` ile çalıştırılmaktadır.

---

## Haftalık Rapor Validasyonları

Haftalık rapor oluşturulurken frontend ve backend tarafında veri kontrolleri uygulanmaktadır.

Temel kontroller:

- Rapor haftası zorunludur.
- Hedeflenen ilerleme zorunludur.
- Gerçekleşen ilerleme zorunludur.
- İlerleme değerleri `0` ile `100` arasında olmalıdır.
- Genel durum zorunludur.
- Takvim durumu zorunludur.
- Risk seviyesi zorunludur.
- Yapılanlar alanı zorunludur.
- Gelecek hafta yapılacaklar alanı zorunludur.
- Engeller alanı isteğe bağlıdır.
- Genel not alanı isteğe bağlıdır.

Frontend tarafında alan bazlı hatalar ilgili form elemanlarının altında gösterilmektedir.

Backend tarafında request DTO'larında Bean Validation kullanılır ve controller seviyesinde `@Valid` ile doğrulama çalıştırılır.

---

## İş Kalemi Validasyonları

İş kalemi işlemlerinde zorunlu alan kontrollerinin yanında tarih bilgilerinin tutarlılığı da kontrol edilmektedir.

Örneğin tamamlanma tarihi ile planlanan tarih arasında geçersiz bir tarih ilişkisi oluşmasına izin verilmez.

---

## Merkezi Hata Yönetimi

Backend tarafında merkezi exception yönetimi kullanılmaktadır.

Temel olarak aşağıdaki HTTP hata durumları yönetilmektedir:

```text
400 Bad Request         - validasyon hatası, geçersiz JSON, geçersiz path/query değeri
401 Unauthorized          - oturum yok, süresi dolmuş veya giriş bilgileri hatalı
403 Forbidden             - oturum var ancak işlem için yetki yok ya da kayıt kullanıcının kapsamı dışında
404 Not Found            - kayıt bulunamadı, bilinmeyen endpoint
405 Method Not Allowed    - endpoint var ama desteklenmeyen HTTP metodu kullanıldı
409 Conflict              - aynı proje ve haftaya ait tekrar rapor oluşturma, veri çakışması
500 Internal Server Error - beklenmeyen/öngörülemeyen hata (genel fallback)
```

Validasyon hataları, geçersiz JSON istekleri, geçersiz path/query parametre değerleri (örn. sayısal olması gereken bir ID yerine metin gönderilmesi) ve bilinmeyen endpoint/metot istekleri kullanıcıya anlamlı hata mesajları döndürecek şekilde ele alınmaktadır. `500` yalnızca gerçekten beklenmeyen durumlar için bir güvenlik ağı olarak kullanılır; istemciye hiçbir zaman stack trace veya iç teknik detay döndürülmez.

Örnek hata cevabı:

```json
{
  "timestamp": "2026-07-30T15:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Hedeflenen ilerleme 100 veya daha küçük olmalıdır.",
  "path": "/api/projects/4/weekly-reports"
}
```

Frontend tarafında backend'den dönen hata mesajları kullanıcıya gösterilmektedir.

Listeleme işlemlerinde hata oluşması durumunda kullanıcıya tekrar deneme imkânı sunulmaktadır.

---

# Build ve Test

## Backend Testleri

Backend testlerini çalıştırmak için:

```powershell
cd backend
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
.\mvnw.cmd test
```

Şu anda bu komut, Spring uygulama bağlamının (application context) hatasız yüklendiğini kontrol eden tek bir testi (`WeeklyProjectStatusApplicationTests`) çalıştırır. İş kuralları ve servis/controller katmanları için ayrı birim testleri henüz yazılmamıştır; API'ler manuel olarak (Swagger, Postman veya tarayıcı üzerinden) doğrulanmaktadır.

Daha kapsamlı Maven doğrulaması için:

```powershell
.\mvnw.cmd clean verify
```

Backend'in yalnızca derlenmesini kontrol etmek için:

```powershell
.\mvnw.cmd -DskipTests compile
```

---

## Frontend Kontrolleri

Frontend production build işlemi:

```powershell
cd frontend
npm run build
```

Kod kalitesi kontrolü için:

```powershell
npm run lint
```

Production build sonucunu yerel olarak önizlemek için:

```powershell
npm run preview
```

Frontend tarafında şu anda ayrı bir otomatik test komutu tanımlı değildir. Temel kullanıcı akışları tarayıcı üzerinden manuel olarak doğrulanmaktadır.

---

# Manuel MVP Test Kapsamı

> **Ayrıntılı test kanıtı:** Senaryo listeleri, hata kayıtları (kök neden ve düzeltme commit'leriyle), tekrar test sonuçları ve kalan riskler için [`docs/test-raporu.md`](docs/test-raporu.md) dosyasına bakınız. Aşağıdaki bölüm yalnızca kapsamın özetidir.

Temel Full Stack akışları backend, frontend ve PostgreSQL birlikte çalıştırılarak manuel olarak test edilmiştir.

Kontrol edilen ana akış:

```text
Backend ve PostgreSQL bağlantısını doğrulama
        ↓
Proje oluşturma
        ↓
Projeleri listeleme
        ↓
Haftalık rapor oluşturma
        ↓
Raporu PostgreSQL'e kaydetme
        ↓
Haftalık raporları görüntüleme
        ↓
Haftalık raporu güncelleme
        ↓
Rapora iş kalemi ekleme
        ↓
İş kalemini güncelleme ve silme
        ↓
Risk / engel kaydı oluşturma
        ↓
Risk / engel kaydını güncelleme ve silme
        ↓
CTO dashboard üzerinden proje durumlarını görüntüleme
        ↓
Dashboard filtrelerini uygulama
        ↓
Rapor detayındaki iş kalemi ve risk bilgilerini görüntüleme
```

Negatif ve validasyon testlerinde ayrıca aşağıdaki durumlar kontrol edilmiştir:

- İlerleme değerinin `100` değerinden büyük olması
- İlerleme değerinin `0` değerinden küçük olması
- Zorunlu alanların boş bırakılması
- Geçersiz proje veya kayıt kimliği kullanılması
- Hatalı tarih değerleri
- Geçersiz JSON isteği
- API hata mesajlarının frontend üzerinde gösterilmesi
- Loading, empty ve error ekran durumları
- Dashboard filtrelerinin beklenen sonucu vermesi

Rol bazlı yetkilendirme senaryoları da test edilmektedir: yetkisiz endpoint erişimi (`403`), oturumsuz erişim (`401`), kullanıcının atanmadığı projeye erişimi (`403`), rol bazlı başlangıç ekranı yönlendirmesi ve arayüzde aksiyon görünürlüğü. Ayrıntılı yetki matrisi ve senaryo listesi için [`docs/t14-authorization-matrix.md`](docs/t14-authorization-matrix.md) dosyasına bakınız.

---

# Demo Verisi ve Kullanıcılar

Uygulama, açılışta çalışan iki seeder içerir. Ayrıntılı yapılandırma için yukarıdaki [Demo / Sunum Verisi](#demo--sunum-verisi) bölümüne bakınız.

| Seeder | Sınıf | Ne yapar | Nasıl tetiklenir |
| --- | --- | --- | --- |
| Rol / yetki / demo kullanıcı | `config/AuthorizationDataInitializer.java` | Rolleri ve yetki demetlerini senkronlar; dört demo kullanıcısını ve örnek proje atamalarını oluşturur | `SEED_USER_PASSWORD` ortam değişkeni tanımlıysa |
| Demo / sunum verisi | `config/DemoDataInitializer.java` | Örnek proje, haftalık rapor, iş kalemi ve risk/engel kayıtlarını oluşturur | `SEED_DEMO_DATA=true` ise |

Her iki seeder de **idempotent**tir; uygulama her açıldığında veri çoğalmaz.

## Demo kullanıcıları

`SEED_USER_PASSWORD` tanımlandığında aşağıdaki kullanıcılar oluşturulur. Parola her kullanıcı için `<e-posta yerel kısmı> + SEED_USER_PASSWORD` desenine göre üretilir; parolanın gizli kısmı kaynak kodda tutulmaz (ayrıntı için yukarıdaki [Demo kullanıcı parolaları](#2-postgresql-veritabanını-hazırlama) bölümüne bakınız).

| E-posta | Ad Soyad | Rol | Görebildiği kapsam |
| --- | --- | --- | --- |
| `pm@demo.local` | Elif Demir | Proje Yöneticisi | Yalnızca atandığı projeler |
| `cto@demo.local` | Murat Yılmaz | CTO | Tüm projeler (salt okunur) |
| `admin@demo.local` | Sistem Yöneticisi | Admin | Tüm projeler (yönetim amaçlı) |
| `lider@demo.local` | Burak Kaya | Ekip Lideri | Yalnızca atandığı projeler (salt okunur) |

Bu değişken tanımlı değilse demo kullanıcıları oluşturulmaz ve sisteme giriş yapılamaz; uygulama başlangıçta bunu uyarı olarak loglar.

## Önerilen demo sırası

Seeder verisiyle (`SEED_DEMO_DATA=true`) rol farkını göstermek için:

1. `cto@demo.local` ile giriş yapın; dashboard açılır, altı projenin tamamı ve özet sayaçlar görünür.
2. Hafta, proje, durum veya risk filtresi uygulayın; boş sonuç davranışını da deneyin.
3. Bir proje satırından rapor detayına girip iş kalemi ve risk bilgilerini görüntüleyin.
4. Çıkış yapıp `pm@demo.local` ile girin; `/reports` ekranına düşersiniz ve yalnızca üç proje görünür.
5. Yeni haftalık rapor oluşturun, rapora iş kalemi ve risk/engel ekleyin.
6. Aynı raporu "Raporu düzenle" ile güncelleyin; hatalı bir ilerleme değeri (`120`) girip alan hatasını da gösterin.
7. `e-Fatura Entegrasyon Modülü` projesini seçip rapor listesinde sayfalamayı görün (12 rapor, sayfa boyutu 10).
8. `admin@demo.local` ile girin; kullanıcı oluşturma ve proje ataması akışını gösterin.
9. `/projects` ekranında bir projeyi düzenleyip durumunu `Bloke` yapın; CTO ile tekrar girip dashboard'daki "bloke proje" sayacının arttığını gösterin.

Seeder kullanılmadan da veriler uygulama arayüzü veya Swagger üzerinden elle oluşturulabilir.

---

# Güvenlik ve Yapılandırma Notları

- PostgreSQL parolası kaynak kodda tutulmaz.
- Gerçek parola, token veya servis anahtarı repository'ye eklenmemelidir.
- `.env` ve `.env.local` dosyaları Git'e gönderilmemelidir.
- `node_modules`, `dist` ve `target` gibi oluşturulan klasörler repository'ye eklenmemelidir.
- Gerçek şirket veya müşteri verileri yerine demo verileri kullanılmalıdır.
- Frontend API adresi ortam değişkeni üzerinden yapılandırılmaktadır.
- Backend veritabanı bilgileri ortam değişkenleri üzerinden alınmaktadır.

---

# Mevcut Durum

Projenin temel MVP akışları çalışır durumdadır.

Tamamlanan ana teknik parçalar:

- Spring Boot backend iskeleti
- React + TypeScript frontend iskeleti
- PostgreSQL bağlantısı
- Katmanlı backend mimarisi
- DTO yapıları
- Project API
- WeeklyReport API
- WorkItem CRUD API
- RiskIssue CRUD API
- Dashboard API
- Dashboard filtreleri
- Frontend API servis katmanı
- Proje ekranları
- Haftalık rapor ekranları
- İş kalemi yönetim ekranı
- Risk/engel yönetim ekranı
- CTO dashboard
- Dashboard detay görünümü
- Form validasyonları
- Backend Bean Validation
- Merkezi exception yönetimi
- Geçersiz JSON hata yönetimi
- Loading, empty ve error durumları
- Backend health kontrolü
- Swagger / OpenAPI
- Frontend production build
- Manuel MVP testleri
- Proje (Project) alan validasyonları (ad ve müşteri adı zorunluluğu, uzunluk sınırı)
- Haftalık rapor güncelleme (`REPORT_UPDATE` yetkisi, hafta çakışmasında `409`)
- Proje güncelleme (durum ve portföy aktifliği dâhil)
- Sorumlu proje yöneticisinin dashboard ve proje listesinde gösterimi
- Dashboard takvim durumu (gecikme) filtresi
- Haftalık rapor listesi filtreleri (hafta, genel durum, risk seviyesi, takvim durumu), Specification tabanlı dinamik sorgu, sayfalama ve sıralama
- Kullanıcı, rol, yetki ve proje atama veri modeli
- Admin ekranı: kullanıcı oluşturma/düzenleme ve proje ataması yönetimi
- Oturum tabanlı kimlik doğrulama (BCrypt parola hash'i, CSRF koruması)
- Yetki bazlı erişim kontrolü (rol adına değil yetkiye dayanan kontroller)
- Proje sahipliği kontrolü (kullanıcı yalnızca atandığı projelerde işlem yapabilir)
- Rol bazlı arayüz: route koruması, menü ve aksiyon görünürlüğü

---

# Bilinen Eksikler ve Sonraki Adımlar

Mevcut sürümde aşağıdaki geliştirmeler henüz tamamlanmamıştır:

- Kullanıcı silme işlemi bulunmamaktadır; erişim, silme yerine kullanıcı pasife alınarak kapatılır. Böylece geçmiş kayıtlardaki kullanıcı izleri korunur.
- Parola sıfırlama ve parola değiştirme akışları bulunmamaktadır; parola yalnızca kullanıcı oluşturulurken belirlenir.
- Kullanıcıya rolünün dışında doğrudan ek yetki verme (`User.additionalPermissions`) veri modelinde desteklenmekte, ancak bunu yöneten bir arayüz bulunmamaktadır.
- Yetki demetleri (hangi rolün hangi yetkilere sahip olduğu) uygulama açılışında sabit seed verisi olarak yüklenir; çalışma zamanında arayüzden yönetilemez.
- Project ve WeeklyReport API'lerinde **silme** endpointleri bulunmamaktadır. Ön Analiz bölüm 12.3 rapor silmeyi "MVP dışında bırakılabilir" olarak işaretlemiş, bölüm 14'teki 3. açık soru da cevaplanmamıştır; bu nedenle silme bilinçli olarak kapsam dışında bırakılmıştır. Güncelleme endpointleri mevcuttur.
- Dashboard ve rapor listesinde "sorumlu" **filtresi** henüz yoktur. Sorumlu proje yöneticisi bilgisi artık dashboard ve proje listesinde **gösterilmektedir**, ancak buna göre filtreleme yapılamamaktadır.
- Enum alanları için Hibernate `CHECK` constraint üretir ve `ddl-auto=update` bu constraint'i güncellemez. Bu nedenle mevcut bir veritabanına yeni bir enum değeri (örneğin yeni bir yetki kodu) eklendiğinde uygulama açılışta hata verir; temiz kurulumda sorun oluşmaz. Ayrıntı ve tek seferlik çözüm için [`docs/test-raporu.md`](docs/test-raporu.md) bölüm 7, bulgu H8'e bakınız.
- Rapor listesi (`GET /api/projects/{projectId}/weekly-reports`) sayfalama ve sıralama destekler; Dashboard ise kasıtlı olarak sayfalanmaz (CTO'nun tüm portföyü tek ekranda görmesi gerektiği için), yalnızca `projectId`/`weekStart` filtreleri veritabanı seviyesinde uygulanır — gerekçe için [`docs/t13-filter-contract.md`](docs/t13-filter-contract.md) dosyasına bakınız.
- Otomatik backend test kapsamı genişletilecektir.
- Frontend için otomatik test altyapısı henüz eklenmemiştir.
- Şema yönetimi Hibernate `ddl-auto=update` ile yapılır; Flyway/Liquibase gibi sürümlenmiş bir migration yapısı bulunmamaktadır. Seed tarafı ise mevcuttur (`AuthorizationDataInitializer` ve `DemoDataInitializer`), ancak uygulama açılışında çalışan idempotent bir seeder'dır; sürümlenmiş bir veri göçü değildir.
- Deployment henüz tamamlanmamıştır; proje şu aşamada doğrulanmış lokal ortam üzerinden çalıştırılmaktadır.
- Geliştirme ilerledikçe README, test sonuçları ve çalıştırma adımları güncellenecektir.

---

# Geliştirme Planı

MVP'nin çalışan sürümü hazır; backend ve frontend, PostgreSQL ile birlikte yerel ortamda doğrulanmış durumdadır. Bunun üzerine T13 (filtreleme, sayfalama, sıralama), T14 (kimlik doğrulama ve rol bazlı yetkilendirme) ve T15 (demo verisi) tamamlanmıştır.

Final teslim öncesi yapılan kapsam denetiminde, Ön Analiz ve yönetmelikte MVP kapsamında olduğu hâlde eksik kalan üç konu tamamlanmıştır: haftalık rapor güncelleme, proje güncelleme ve sorumlu proje yöneticisinin gösterimi.

Sıradaki planlanan geliştirmeler:

1. **Otomatik test kapsamının genişletilmesi.** Mevcut durumda yalnızca uygulama bağlamının yüklendiğini doğrulayan tek bir test bulunuyor; iş kuralları, yetkilendirme ve filtreleme davranışları manuel olarak doğrulanmaktadır. Bu, projenin en büyük açık riskidir (bkz. [`docs/test-raporu.md`](docs/test-raporu.md), "Kalan riskler").
2. **Sorumlu filtresi.** Sorumlu bilgisi artık gösteriliyor; dashboard ve rapor listesi endpointlerine `responsibleUserId` parametresinin eklenmesi kalmıştır.
3. **Sürümlenmiş migration (Flyway/Liquibase).** `ddl-auto=update` şema evrimini karşılamıyor (bkz. bulgu H8).
4. **Deployment.** Proje şu aşamada doğrulanmış lokal ortam üzerinden çalıştırılmaktadır.

Daha sonraki aşamalarda ihtiyaç ve süreye bağlı olarak:

- Gelişmiş raporlama
- Gelişmiş risk takibi
- Audit log
- PDF / Excel çıktısı
- Haftalık trend gösterimi
- CI/CD
- Monitoring

gibi özellikler değerlendirilebilir.

---

# Doğrulanan Lokal Çalıştırma Akışı

Projeyi temiz bir yerel ortamda çalıştırmak için önerilen sıra:

```text
1. PostgreSQL'i çalıştır
        ↓
2. weekly_project_status veritabanını oluştur
        ↓
3. DB_PASSWORD ortam değişkenini tanımla
        ↓
4. Backend'i çalıştır
        ↓
5. /api/health endpointini kontrol et
        ↓
6. Frontend .env.local dosyasını hazırla
        ↓
7. Frontend'i çalıştır
        ↓
8. http://localhost:5173 adresini aç
        ↓
9. Proje → Rapor → İş Kalemi / Risk → Dashboard akışını doğrula
```

Frontend, backend'e istek atarken tarayıcı konsolunda CORS hatası alırsa "CORS Yapılandırması" bölümüne bakın.

Backend, frontend ve PostgreSQL bu sırayla birlikte çalıştırılarak aşağıdaki noktalar doğrulanmıştır:

- Backend derlemesi ve frontend production build'i hatasız tamamlanıyor.
- Backend, PostgreSQL'e bağlanıyor; `/api/health` ve Swagger arayüzü erişilebilir.
- CORS yapılandırması `http://localhost:5173` origin'inden gelen istekleri kabul ediyor, farklı bir origin'den gelen isteği reddediyor.
- Proje oluşturma, haftalık rapor oluşturma, iş kalemi ve risk/engel ekleme, dashboard'da görüntüleme ve filtreleme akışı uçtan uca çalışıyor.
- Aynı proje ve aynı haftaya ikinci bir rapor oluşturma isteği `409 Conflict` ile engelleniyor; farklı bir haftaya (geçmiş tarihli dahil) rapor oluşturma çalışıyor.
- Geçersiz istek senaryolarında (`400`, `404`, `405`) beklenen hata kodları dönüyor.

---

## Repository

GitHub repository:

```text
https://github.com/aksucemilee/weekly-project-status-system
```
