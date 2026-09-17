# Labour Management System (Modular Monolith)

Spring Boot 3 + MySQL. **Docker nahi, Redis nahi, S3 nahi, payment gateway nahi** — ye sab Phase 9 me baad me lagega.

## Chahiye
- Java 17, Maven 3.9+
- MySQL 8 running on localhost:3306

## Setup
1. `.env.example` ko copy karke `.env` banao (ya environment variables set karo):
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`
2. MySQL me database khud ban jayegi (`createDatabaseIfNotExist=true`). Tables **Flyway** banayega (`V1..V9`).
3. Run:
   ```
   mvn spring-boot:run
   ```
   Ya `application-dev.yml` profile ke saath IDE se `LabourManagementApplication` chalao.

4. Default admin (sirf dev): `admin / Admin@123` — login ke baad turant password change karna.

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
