# GP Tanakpur Portal — Live karne ki guide (Hinglish)

Pehle ye app sirf browser me chalta tha (data refresh/deploy par kho jata tha, passwords code me the).
Ab: **PostgreSQL database + secure server login + server-side RBAC**.

## 1. Database banao (free)
[Neon](https://neon.tech) ya [Supabase](https://supabase.com) par free Postgres banao → connection string copy karo.

## 2. Environment variables
`.env.example` ko `.env.local` me copy karo aur bharo:

| Variable | Kaise milega |
|---|---|
| `DATABASE_URL` | Neon/Supabase connection string |
| `AUTH_SECRET` | `openssl rand -base64 48` |
| `DATA_ENCRYPTION_KEY` | `openssl rand -base64 32` (**kho diya to Aadhaar decrypt nahi hoga — backup rakho**) |
| `ADMIN_INITIAL_PASSWORD` | (optional) Principal ka pehla password |
| `FAST2SMS_API_KEY` | (optional) real SMS/OTP ke liye. Bina iske production me OTP **nahi** jayega |
| `CRON_SECRET` | koi bhi lamba random string (auto reminders ke liye) |
| `GEMINI_API_KEY` | AI doubt solver ke liye |

Hosting (Vercel/Cloud Run/etc.) ke settings me bhi yahi variables daalo.

## 3. Pehli baar setup
```bash
npm install
npm run db:setup      # tables banata hai + purana demo data dalta hai
```
`seed-credentials.txt` me sab ke temporary passwords milenge (pehle login par badalna zaroori hai). Use padhne ke baad **delete** kar do.

## 4. Chalao
```bash
npm run dev           # local
npm run build && npm start
```
Check: `/api/health` → `{"ok":true,"db":"up"}`

## 5. Auto reminders (3 reminder system)
`GET /api/cron/reminders` ko har ghante call karo, header: `Authorization: Bearer <CRON_SECRET>`.
Vercel par `vercel.json` already hai (CRON_SECRET env set karo). Reminder 1 → 7 din, 2 → 3 din, 3 → 1 din pehle.

## Kya real ho gaya
- Login server par (bcrypt hash, 8-ghante session cookie, 5 galat try → 15 min lock)
- Marks edit ka subject-RBAC **server** par enforce hota hai (browser se bypass nahi)
- Student ko sirf apna data milta hai; Aadhaar AES-256-GCM se encrypted, UI me sirf masked
- Password reset: real OTP (hashed, 10 min, 5 try), OTP kabhi screen par nahi dikhta
- Data database me → refresh/redeploy/dusre device par bhi wahi data; doubts/notifications 20 sec me refresh
- Service worker ab `/api` cache nahi karta (pehle purana data dikhata tha)

## Abhi bhi demo/static (agla phase)
Attendance, placement companies, interview Q&A, academic resource library, quiz stats, mentorship booking — ye abhi code ke andar ka static data hai
(database me nahi). Resume/photo base64 me save hota hai (chhote files theek; badi files ke liye file storage chahiye).
MFA (OTP at login) abhi enforce nahi hota.
