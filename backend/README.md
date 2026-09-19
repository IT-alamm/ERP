# Labour Management System (Modular Monolith)

Spring Boot 3 + PostgreSQL (Supabase prod). **Docker nahi, Redis nahi, S3 nahi, payment gateway nahi** — ye sab Phase 9 me baad me lagega.

## Chahiye
- Java 17, Maven 3.9+
- Prod: Supabase Postgres (`SPRING_PROFILES_ACTIVE=prod` + `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` env vars)
- Test: MySQL 8 running on localhost:3306

## Setup
1. `.env.example` ko copy karke `.env` banao (ya environment variables set karo):
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`
2. Supabase me database pehle se bani hoti hai (`postgres`). Tables **Flyway** banayega (`V1..V11`, PostgreSQL dialect).
3. Run:
   ```
   mvn spring-boot:run
   ```
   Ya `application-dev.yml` profile ke saath IDE se `LabourManagementApplication` chalao.

4. Default admin (sirf dev): `admin / Admin@123` — login ke baad turant password change karna.

## Docker (deploy)
1. `backend/.env.example` ko copy karke `backend/.env` banao, real values bharo (Supabase `DB_URL`/`DB_USERNAME`/`DB_PASSWORD`, strong `JWT_SECRET`). Ye file commit mat karna.
2. Run:
   ```
   docker compose -f backend/docker-compose.yml up -d --build
   ```
   Pehle boot par Flyway `V1..V11` tables banayega. Health: `http://localhost:8080/actuator/health`.
3. Logs: `docker compose -f backend/docker-compose.yml logs -f api`.

## API
- Swagger: `http://localhost:8080/swagger-ui.html`
- Login: `POST /api/v1/auth/login` → `{username, password}` → `{accessToken, refreshToken}`
- Admin: `/api/v1/admin/labours`, `/api/v1/admin/attendance`, `/api/v1/admin/projects`, `/api/v1/admin/leaves`, `/api/v1/admin/payroll`, `/api/v1/admin/documents`, `/api/v1/admin/audit`, `/api/v1/admin/dashboard/stats`
- Labour: `/api/v1/labour/profile`, `/api/v1/labour/attendance`, `/api/v1/labour/leaves`, `/api/v1/labour/payroll`, `/api/v1/labour/projects`
- Notifications: `/api/v1/notifications`

## Notes
- Payroll me **PAID status manual hai** (cash/bank transfer ka record). Online payment gateway baad me.
- Documents **local `./uploads` folder** me save hote hain. S3/MinIO baad me.
- Notifications **sirf DB me**. Email/SMS/WhatsApp baad me.
- `ddl-auto=validate` hai — schema change hamesha **nayi Flyway migration** se karna.
