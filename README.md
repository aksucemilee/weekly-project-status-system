# Haftalık Proje Durum Raporlama ve CTO Takip Sistemi

Proje yöneticilerinin haftalık durum raporlarını oluşturabildiği, CTO’nun ise projelerin ilerleme, durum ve risk bilgilerini tek ekrandan takip edebildiği Full Stack staj projesidir.

## Kullanılan Teknolojiler

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- PostgreSQL
- Bean Validation
- Swagger / OpenAPI
- Maven

### Frontend

- React
- TypeScript
- Vite
- React Router
- MUI
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

Farklı bir kullanıcı adı veya bağlantı adresi kullanılacaksa şu değişkenler de tanımlanabilir:

```powershell
$env:DB_USERNAME='POSTGRESQL_KULLANICI_ADINIZ'
$env:DB_URL='jdbc:postgresql://localhost:5432/weekly_project_status'
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
```

`DB_URL` ve `DB_USERNAME` tanımlanmazsa proje şu varsayılan değerleri kullanır:

```text
DB_URL=jdbc:postgresql://localhost:5432/weekly_project_status
DB_USERNAME=postgres
```

Her kullanıcı kendi PostgreSQL bilgilerini kullanmalıdır. Gerçek parolalar README dosyasına veya GitHub repository’sine eklenmemelidir.

## Backend’i Çalıştırma

Proje klasöründe:

```powershell
cd backend
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
.\mvnw.cmd spring-boot:run
```

Backend adresi:

```text
http://localhost:8080
```

Health endpoint:

```text
http://localhost:8080/api/health
```

Swagger arayüzü:

```text
http://localhost:8080/swagger-ui/index.html
```

## Frontend Ayarları

Frontend’in backend ile bağlantı kurabilmesi için `frontend/.env.local` dosyası oluşturulmalıdır.

Dosyanın içeriği:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

`.env.local` yalnızca yerel bilgisayarda tutulur ve GitHub’a gönderilmez. Örnek yapılandırma için `frontend/.env.example` dosyası kullanılabilir.

## Frontend’i Çalıştırma

Proje klasöründe:

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

## Build Kontrolleri

Backend kontrolü:

```powershell
cd backend
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
.\mvnw.cmd clean verify
```

Frontend kontrolü:

```powershell
cd frontend
npm run build
```

## Güvenlik Notları

- Gerçek PostgreSQL parolası kaynak kodda tutulmaz.
- `.env` ve `.env.local` dosyaları GitHub’a gönderilmez.
- `node_modules`, `dist` ve `target` klasörleri repository’ye eklenmez.
- Projede gerçek şirket veya müşteri verileri yerine demo veriler kullanılır.

## Mevcut Durum

Şu ana kadar tamamlanan çalışmalar:

- Spring Boot backend iskeleti
- PostgreSQL bağlantı ayarları
- Health endpoint
- Swagger / OpenAPI yapılandırması
- React ve TypeScript frontend iskeleti
- React Router yapılandırması
- MUI kurulumu
- Axios API client yapısı
- Temel dashboard sayfası ve yönlendirmesi
