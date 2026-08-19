# Haftalık Proje Durum Raporlama ve CTO Takip Sistemi

Kolaysoft staj projesi kapsamında geliştirilen Full Stack web uygulamasıdır.

Projenin amacı, proje yöneticilerinin haftalık proje durumlarını standart bir yapıda raporlayabilmesini ve CTO'nun farklı projelerin ilerleme, durum, takvim, risk ve aktif iş bilgilerini tek bir ekran üzerinden takip edebilmesini sağlamaktır.

Sistem kapsamında proje ve haftalık rapor yönetiminin yanında iş kalemleri, risk/engel kayıtları ve filtrelenebilir bir CTO dashboard yapısı geliştirilmektedir.

---

## Projenin Temel Özellikleri

Mevcut sürümde aşağıdaki temel akışlar bulunmaktadır:

- Proje oluşturma ve listeleme
- Proje detayını görüntüleme
- Haftalık proje durum raporu oluşturma ve listeleme
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
├── .gitignore
└── README.md
```

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
```

Varsayılan değerler:

```text
DB_URL=jdbc:postgresql://localhost:5432/weekly_project_status
DB_USERNAME=postgres
JPA_DDL_AUTO=update
```

`DB_PASSWORD` için varsayılan bir parola bulunmamaktadır ve yerel ortamda tanımlanması gerekir.

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

| Route        | Açıklama                    |
| ------------ | --------------------------- |
| `/login`     | Giriş ekranı                |
| `/dashboard` | CTO proje durum dashboard'u |
| `/projects`  | Proje yönetimi              |
| `/reports`   | Haftalık rapor yönetimi     |
| `/admin`     | Admin ekranı                |

Ana adres `/` otomatik olarak `/dashboard` sayfasına yönlendirilir.

> Giriş ekranı ve admin route'u mevcut olmakla birlikte gerçek authentication ve rol bazlı yetkilendirme henüz uygulanmamıştır.

---

# Backend API

Tüm temel backend endpointleri `/api` altında çalışmaktadır.

Swagger arayüzü mevcut API sözleşmesini incelemek ve test etmek için kullanılabilir.

## Health

| Metot | Endpoint      | Açıklama                             |
| ----- | ------------- | ------------------------------------ |
| `GET` | `/api/health` | Backend servis durumunu kontrol eder |

---

## Project

| Metot  | Endpoint                    | Açıklama                             |
| ------ | --------------------------- | ------------------------------------ |
| `POST` | `/api/projects`             | Yeni proje oluşturur                 |
| `GET`  | `/api/projects`             | Tüm projeleri listeler               |
| `GET`  | `/api/projects/{projectId}` | Belirtilen projenin detayını getirir |

---

## Weekly Report

| Metot  | Endpoint                                                    | Açıklama                                     |
| ------ | ----------------------------------------------------------- | -------------------------------------------- |
| `POST` | `/api/projects/{projectId}/weekly-reports`                  | Projeye haftalık rapor oluşturur             |
| `GET`  | `/api/projects/{projectId}/weekly-reports`                  | Projeye ait haftalık raporları listeler      |
| `GET`  | `/api/projects/{projectId}/weekly-reports/{weeklyReportId}` | Belirtilen haftalık raporun detayını getirir |

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

| Parametre       | Açıklama                             |
| --------------- | ------------------------------------ |
| `weekStart`     | Rapor haftasına göre filtreleme      |
| `projectId`     | Projeye göre filtreleme              |
| `generalStatus` | Genel proje durumuna göre filtreleme |
| `riskLevel`     | Risk seviyesine göre filtreleme      |

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
- Proje oluşturma sırasında oluşan API hataları frontend üzerinde kullanıcıya gösterilir.
- Listeleme sırasında loading, empty ve error durumları yönetilir.

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

Seçilen projeye ait geçmiş haftalık raporlar listelenebilir ve rapor detayları görüntülenebilir.

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
- Proje durum tablosu
- Proje ve rapor detay görünümü
- İş kalemi bilgileri
- Risk ve engel bilgileri
- Hafta filtresi
- Proje filtresi
- Genel durum filtresi
- Risk seviyesi filtresi
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

Rol bazlı test senaryoları authentication ve RBAC henüz uygulanmadığı için mevcut sürümde kapsam dışındadır.

---

# Demo Verisi ve Kullanıcılar

Mevcut sürümde otomatik seed yapısı bulunmamaktadır.

Demo verileri:

- Uygulama arayüzü
- Swagger

üzerinden oluşturulabilir.

Önerilen demo sırası:

1. Yeni bir proje oluşturun.
2. Proje için haftalık rapor ekleyin.
3. Rapora en az bir iş kalemi ekleyin.
4. Rapora risk veya engel kaydı ekleyin.
5. Dashboard'a geçin.
6. Özet kartlarını ve proje tablosunu kontrol edin.
7. Hafta, proje, durum veya risk filtresi uygulayın.
8. Proje detayına girerek rapor, iş kalemi ve risk bilgilerini görüntüleyin.

Authentication henüz uygulanmadığı için mevcut sürümde tanımlı demo kullanıcı adı veya parola bulunmamaktadır.

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

---

# Bilinen Eksikler ve Sonraki Adımlar

Mevcut sürümde aşağıdaki geliştirmeler henüz tamamlanmamıştır:

- Gerçek kullanıcı authentication yapısı uygulanmamıştır. Kullanıcı, rol ve yetkilendirme için gerekli veri modeli (`User`, `Role` gibi varlıklar) backend'de henüz bulunmamaktadır.
- Rol bazlı yetkilendirme (RBAC) uygulanmamıştır. Giriş, oturum ve admin işlemleri için API endpointleri henüz geliştirilmemiştir.
- Proje yöneticisi, CTO ve admin rollerine göre erişim sınırları henüz bulunmamaktadır.
- `401 Unauthorized` ve `403 Forbidden` senaryoları authentication/RBAC aşamasında tamamlanacaktır.
- Login ekranı mevcut olsa da yalnızca görsel bir taslaktır; herhangi bir API çağrısı veya oturum yönetimine bağlı değildir.
- Admin ekranı mevcut olsa da rol bazlı yönetim özellikleri henüz tamamlanmamıştır.
- Project API üzerinde güncelleme ve silme endpointleri mevcut değildir.
- WeeklyReport API üzerinde güncelleme ve silme endpointleri mevcut değildir.
- Otomatik backend test kapsamı genişletilecektir.
- Frontend için otomatik test altyapısı henüz eklenmemiştir.
- Kontrollü migration ve seed yapısı henüz bulunmamaktadır.
- Deployment henüz tamamlanmamıştır; proje şu aşamada doğrulanmış lokal ortam üzerinden çalıştırılmaktadır.
- Geliştirme ilerledikçe README, test sonuçları ve çalıştırma adımları güncellenecektir.

---

# Geliştirme Planı

MVP'nin çalışan sürümü hazır; backend ve frontend, PostgreSQL ile birlikte yerel ortamda doğrulanmış durumdadır.

Sıradaki planlanan geliştirmeler:

1. Dashboard filtrelerinin genişletilmesi (ek filtre seçenekleri, sayfalama)
2. Authentication ve rol bazlı yetkilendirme
3. Yetkili ve yetkisiz kullanıcı senaryolarının test edilmesi

Daha sonraki aşamalarda ihtiyaç ve süreye bağlı olarak:

- Gelişmiş raporlama
- Sayfalama ve sıralama
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
