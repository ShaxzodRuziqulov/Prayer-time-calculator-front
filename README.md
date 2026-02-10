# Prayer Time Client

Vue 3 + Vite + TypeScript frontend for Spring Boot JWT backend.

## Stack

- Vue 3
- Vite
- TypeScript (strict)
- Vue Router
- Pinia
- Axios
- Zod
- Day.js
- TailwindCSS
- Vitest

## Project Structure

```txt
.
├─ src/
│  ├─ api/
│  │  ├─ http.ts
│  │  ├─ error.ts
│  │  └─ modules/
│  │     ├─ auth.ts
│  │     ├─ user.ts
│  │     ├─ qaza.ts
│  │     ├─ reminder.ts
│  │     └─ goal.ts
│  ├─ components/
│  │  ├─ common/
│  │  │  ├─ BaseButton.vue
│  │  │  ├─ BaseInput.vue
│  │  │  ├─ BaseAlert.vue
│  │  │  └─ BaseLoader.vue
│  │  └─ layout/
│  │     └─ AppShell.vue
│  ├─ router/
│  │  └─ index.ts
│  ├─ stores/
│  │  └─ auth.ts
│  ├─ utils/
│  │  ├─ date.ts
│  │  ├─ date.spec.ts
│  │  └─ validation.ts
│  ├─ views/
│  │  ├─ AuthView.vue
│  │  ├─ ConvertGuestView.vue
│  │  ├─ DashboardView.vue
│  │  ├─ ProfileView.vue
│  │  ├─ RemindersView.vue
│  │  └─ GoalsView.vue
│  ├─ types/index.ts
│  ├─ App.vue
│  ├─ main.ts
│  ├─ style.css
│  ├─ vite-env.d.ts
│  └─ api/error.spec.ts
├─ .env.example
├─ index.html
├─ package.json
├─ tailwind.config.cjs
├─ postcss.config.cjs
├─ vite.config.ts
├─ tsconfig.json
├─ tsconfig.app.json
└─ tsconfig.node.json
```

## Setup

1. Copy env:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start dev server:

```bash
npm run dev
```

Frontend default port is Vite default (`5173`), backend API base should be:

`http://localhost:8080`

## Environment

`.env`

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## API Flow

### Auth

- Login/Register/Guest on `/auth`.
- JWT token `localStorage`ga saqlanadi.
- `convert-guest` faqat guest user uchun ochiladi.

### User

- `/profile` da:
- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/me/password`

### Qaza

- `/dashboard` da:
- `GET /api/qaza/get-all` (summary)
- `POST /api/qaza/add`
- `POST /api/qaza/init`
- `POST /api/qaza/complete`
- `GET /api/qaza/history`

### Reminders

- `/settings/reminders`:
- `POST /api/reminders`
- `DELETE /api/reminders/{id}`
- List endpoint yo‘qligi sabab local optimistic list ishlatilgan.

### Goals

- `/goals`:
- `POST /api/goals`
- `PUT /api/goals/{goalId}/increment?value=1`
- List endpoint berilmaganligi sabab local optimistic list ishlatilgan.

## Error Handling

- Backend `message` form alert orqali chiqariladi.
- Network xato: `Serverga ulanib bo‘lmadi`.
- `401` javobida avtomatik logout va `/auth`ga redirect.

## Tests

```bash
npm run test
```

Currently included:

- `src/api/error.spec.ts`
- `src/utils/date.spec.ts`

