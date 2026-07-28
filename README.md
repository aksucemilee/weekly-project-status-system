# Haftalık Proje Durum Raporlama ve CTO Takip Sistemi

Proje yöneticilerinin haftalık proje durum raporlarını oluşturabildiği, CTO'nun ise projelerin ilerleme, durum ve risk bilgilerini takip edebildiği Full Stack staj projesidir.

## Teknolojiler

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
└── README.md
```

## Gereksinimler

Projeyi çalıştırmak için aşağıdaki araçların kurulu olması gerekir:

- Java 21
- Node.js ve npm
- PostgreSQL
- Git

## Veritabanı

PostgreSQL üzerinde `weekly_project_status` isimli veritabanı kullanılmaktadır.

Varsayılan bağlantı bilgileri:

- Sunucu: localhost
- Port: 5432
- Kullanıcı: postgres
- Veritabanı: weekly_project_status

Veritabanı parolası kaynak kodda tutulmaz. Backend çalıştırılmadan önce PowerShell terminalinde ortam değişkeni olarak tanımlanır:

```powershell
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
```

PostgreSQL üzerinde veritabanını oluşturmak için:

```sql
CREATE DATABASE weekly_project_status;
```

## Backend'i Çalıştırma

```powershell
cd backend
$env:DB_PASSWORD='POSTGRESQL_PAROLANIZ'
.\mvnw.cmd spring-boot:run
```

Backend varsayılan olarak aşağıdaki adreste çalışır:

```text
http://localhost:8080
```

Health endpoint:

```text
http://localhost:8080/api/health
```

Swagger arayüzü:

```text
http://localhost:8080/swagger-ui.html
```

## Frontend'i Çalıştırma

Frontend için `frontend/.env.local` dosyasında aşağıdaki API adresi tanımlanmalıdır:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Frontend'i çalıştırmak için proje kök dizininden:

```powershell
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak aşağıdaki adreste çalışır:

```text
http://localhost:5173
```

Dashboard adresi:

```text
http://localhost:5173/dashboard
```

## Build ve Test Kontrolleri

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

- Gerçek PostgreSQL parolası README dosyasına veya GitHub'a eklenmez.
- `frontend/.env.local` yalnızca yerel bilgisayarda tutulur.
- `frontend/.env.example` örnek yapılandırma dosyası olarak repository'de bulunur.
- `node_modules`, `dist` ve `target` klasörleri repository'ye eklenmez.
