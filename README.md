# URL Shortener

## 실행

Node.js 20.9 이상 필요.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local`에 관리자 비밀번호를 설정합니다. 기본 로컬 모드는 `.data/urls.json`에 저장합니다.

## Neon 및 Vercel

Neon SQL Editor에서 `sql/schema.sql`을 실행합니다. Vercel 환경변수:

- `STORAGE_MODE=neon`
- `DATABASE_URL`: Neon pooled connection string
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `APP_URL`: 최종 Production 주소

관리자 경로는 `/admin`, 사용자 이름은 `admin`입니다.
