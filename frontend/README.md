# LabourOps Frontend (React + Vite + Tailwind v4)

Design Stitch project "Labour Management System" se inspired (navy sidebar, telemetry cards).
`../stitch-reference/` me Stitch screenshots rakhe hain.

## Chalana
```
npm install
npm run dev      # http://localhost:5173
```
Backend `http://localhost:8080` par chalna chahiye. URL badalna ho to `.env` me `VITE_API_URL` set karo.

## Login
- Admin: `admin / Admin@123` → `/admin` dashboard
- Labour: admin se bana hua account → `/home` dashboard

Token localStorage me, 401 par auto-refresh, har request par `Authorization: Bearer` lagta hai.
Backend ka CORS dev me `localhost:*` allow karta hai.
