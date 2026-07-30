# Haftalık Proje Durum Raporlama ve CTO Takip Sistemi

Proje yöneticilerinin haftalık durum raporlarını oluşturmasını ve CTO’nun projelerin ilerleme, durum ve risk bilgilerini tek ekrandan takip edebilmesini amaçlayan Full Stack staj projesidir.

## Kullanılan Teknolojiler

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Bean Validation
- PostgreSQL
- Swagger / OpenAPI
- Maven

### Frontend

- React
- TypeScript
- Vite
- React Router
- Material UI
- Axios

## Proje Yapısı

```text
weekly-project-status-system/
├── backend/
├── frontend/
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

## Gereksinimler

Projeyi çalıştırmak için aşağıdaki araçların kurulu olması gerekir:

- Java 21
- Node.js ve npm
- PostgreSQL
- Git

## Veritabanı Ayarları

Projede PostgreSQL kullanılmaktadır.

Varsayılan bağlantı bilgileri:

- Sunucu: `localhost`
- Port: `5432`
- Kullanıcı: `postgres`
- Veritabanı: `weekly_project_status`

Veritabanını oluşturmak için PostgreSQL üzerinde şu komut çalıştırılabilir:

```sql
CREATE DATABASE weekly_project_status;
```

Veritabanı parolası güvenlik nedeniyle kaynak kodda tutulmaz. Backend çalıştırılmadan önce PostgreSQL parolası ortam değişkeni olarak tanımlanmalıdır.

PowerShell üzerinde:

```powershell
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
```

Farklı bir kullanıcı adı veya bağlantı adresi kullanılacaksa aşağıdaki ortam değişkenleri de tanımlanabilir:

```powershell
$env:DB_USERNAME='POSTGRESQL_KULLANICI_ADINIZ'
$env:DB_URL='jdbc:postgresql://localhost:5432/weekly_project_status'
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
```

`DB_URL` ve `DB_USERNAME` tanımlanmazsa proje aşağıdaki varsayılan değerleri kullanır:

```text
DB_URL=jdbc:postgresql://localhost:5432/weekly_project_status
DB_USERNAME=postgres
```

Her kullanıcı kendi PostgreSQL bilgilerini kullanmalıdır. Gerçek parolalar README dosyasına veya GitHub repository’sine eklenmemelidir.

Uygulama başlatılırken `JPA_DDL_AUTO` ortam değişkeni verilmezse geliştirme ortamında varsayılan olarak `update` değeri kullanılır.

## Backend’i Çalıştırma

Projenin ana klasöründe aşağıdaki komutlar çalıştırılır:

```powershell
cd backend
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
.\mvnw.cmd spring-boot:run
```

Backend adresi:

```text
http://localhost:8080
```

Health endpointi:

```text
http://localhost:8080/api/health
```

Swagger arayüzü:

```text
http://localhost:8080/swagger-ui/index.html
```

## API Endpointleri

| Metot  | Endpoint                                   | Açıklama                                       |
| ------ | ------------------------------------------ | ---------------------------------------------- |
| `GET`  | `/api/health`                              | Backend sağlık kontrolünü gerçekleştirir       |
| `POST` | `/api/projects`                            | Yeni proje oluşturur                           |
| `GET`  | `/api/projects`                            | Projeleri listeler                             |
| `GET`  | `/api/projects/{projectId}`                | Seçilen projenin detayını getirir              |
| `POST` | `/api/projects/{projectId}/weekly-reports` | Seçilen projeye haftalık rapor ekler           |
| `GET`  | `/api/projects/{projectId}/weekly-reports` | Seçilen projenin haftalık raporlarını listeler |

## Frontend Ayarları

Frontend’in backend ile bağlantı kurabilmesi için `frontend/.env.local` dosyası oluşturulmalıdır.

Dosyanın içeriği:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

`.env.local` yalnızca yerel bilgisayarda tutulur ve GitHub’a gönderilmez. Örnek yapılandırma için `frontend/.env.example` dosyası kullanılabilir.

## Frontend’i Çalıştırma

Projenin ana klasöründe aşağıdaki komutlar çalıştırılır:

```powershell
cd frontend
npm install
npm run dev
```

Frontend adresi:

```text
http://localhost:5173
```

Dashboard adresi:

```text
http://localhost:5173/dashboard
```

## Build ve Test Kontrolleri

Backend testlerini çalıştırmak için:

```powershell
cd backend
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
.\mvnw.cmd test
```

Daha kapsamlı bir Maven doğrulaması için:

```powershell
.\mvnw.cmd clean verify
```

Frontend production build işlemi için:

```powershell
cd frontend
npm run build
```

## Güvenlik Notları

- Gerçek PostgreSQL parolası kaynak kodda tutulmaz.
- `.env` ve `.env.local` dosyaları GitHub’a gönderilmez.
- `node_modules`, `dist` ve `target` klasörleri repository’ye eklenmez.
- Projede gerçek şirket veya müşteri verileri yerine demo veriler kullanılır.
- Gizli bilgiler yalnızca ortam değişkenleri üzerinden yönetilir.

## Mevcut Durum

Şu ana kadar tamamlanan çalışmalar aşağıda yer almaktadır.

### Backend

- Spring Boot proje iskeleti oluşturuldu.
- PostgreSQL bağlantısı ve ortam değişkeni yapılandırması hazırlandı.
- `Project` ve `WeeklyReport` veri modelleri oluşturuldu.
- Request ve response DTO yapıları hazırlandı.
- Repository, service ve controller katmanları geliştirildi.
- Proje oluşturma, listeleme ve detay endpointleri geliştirildi.
- Haftalık rapor oluşturma ve listeleme endpointleri geliştirildi.
- Aynı proje ve rapor haftası için ikinci kaydın oluşturulması engellendi.
- Haftalık rapor alanları için backend validasyonları eklendi.
- İlerleme değerleri için `0-100` aralığı kontrolü eklendi.
- Zorunlu alanlarda `@NotNull` ve `@NotBlank` kontrolleri kullanıldı.
- DTO validasyonlarının çalıştırılması için controller katmanında `@Valid` kullanıldı.
- Merkezi `400 Bad Request`, `404 Not Found` ve `409 Conflict` hata yönetimi geliştirildi.
- Validasyon hatalarının ortak hata formatında ve anlaşılır mesajlarla dönmesi sağlandı.
- Swagger / OpenAPI yapılandırması tamamlandı.
- Endpointler PostgreSQL üzerinde gerçek API istekleriyle test edildi.
- Geçerli ve geçersiz haftalık rapor istekleri Swagger üzerinden doğrulandı.
- Backend test komutu başarıyla çalıştırıldı.

### Frontend

- React ve TypeScript proje iskeleti oluşturuldu.
- Vite yapılandırması tamamlandı.
- React Router yönlendirme yapısı kuruldu.
- Material UI projeye eklendi.
- Ortak Axios API client yapısı oluşturuldu.
- Temel dashboard sayfası geliştirildi.
- Proje listeleme sayfası backend API ile entegre edildi.
- Haftalık rapor oluşturma formu backend API ile entegre edildi.
- Seçilen projeye ait haftalık raporların listelenmesi sağlandı.
- Rapor haftası ve ilerleme alanları için form validasyonları eklendi.
- İlerleme değerleri için `0-100` aralığı kontrolü eklendi.
- Yapılanlar ve gelecek hafta yapılacaklar alanları zorunlu hâle getirildi.
- Proje ve rapor listeleri için loading, empty ve error durumları eklendi.
- Form gönderimi sırasında tekrar gönderimi engelleyen yüklenme durumu eklendi.
- Başarılı ve başarısız işlemler için kullanıcı mesajları eklendi.
- Yeni bir form işlemi başladığında önceki başarı ve hata mesajlarının temizlenmesi sağlandı.
- Frontend production build işlemi başarıyla tamamlandı.

## Haftalık Rapor Validasyonları

Haftalık rapor oluşturulurken hem frontend hem backend tarafında aşağıdaki kontroller uygulanmaktadır:

- Rapor haftası zorunludur.
- Hedeflenen ilerleme zorunludur.
- Gerçekleşen ilerleme zorunludur.
- İlerleme değerleri `0` ile `100` arasında tam sayı olmalıdır.
- Genel durum zorunludur.
- Takvim durumu zorunludur.
- Risk seviyesi zorunludur.
- Yapılanlar alanı zorunludur.
- Gelecek hafta yapılacaklar alanı zorunludur.
- Engeller alanı isteğe bağlıdır.
- Genel not alanı isteğe bağlıdır.

Validasyon hataları backend tarafından ortak hata formatında dönmektedir.

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

## Doğrulanan Temel Akış

Aşağıdaki Full Stack senaryosu backend, frontend ve PostgreSQL birlikte çalıştırılarak doğrulanmıştır:

```text
Proje oluşturma
→ projeleri listeleme
→ proje detayını görüntüleme
→ proje için haftalık rapor oluşturma
→ raporu PostgreSQL'e kaydetme
→ seçilen projeye ait raporları frontend üzerinde listeleme
```

Aşağıdaki hata ve validasyon senaryoları da kontrol edilmiştir:

- `100` değerinden büyük ilerleme gönderilmesi
- `0` değerinden küçük ilerleme gönderilmesi
- Zorunlu rapor alanlarının boş gönderilmesi
- Olmayan proje kimliğiyle haftalık rapor oluşturulması
- Frontend formunun eksik veya hatalı değerlerle gönderilmesi
- Başarılı işlem mesajının yeni bir form işleminde ekranda kalması

## Bilinen Eksikler ve Sonraki Adımlar

- İş kalemi yönetimi henüz geliştirilmedi.
- Ayrıntılı risk ve engel kayıtları henüz geliştirilmedi.
- Kullanıcı girişi ve rol bazlı yetkilendirme henüz eklenmedi.
- CTO dashboard temel görünümü dışında henüz tamamlanmadı.
- Dashboard filtreleri henüz geliştirilmedi.
- Otomatik backend test kapsamı genişletilecek.
- Swagger üzerindeki response kodu açıklamaları geliştirilecek.
- Demo amacıyla oluşturulan gereksiz test kayıtları temizlenecek veya kontrollü seed verisine dönüştürülecek.
