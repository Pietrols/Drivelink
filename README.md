# DriveLink

A peer-to-peer car hire platform connecting drivers who own vehicles with clients who need them. Built as a TypeScript monorepo with a microservices architecture.

---

## Project Status

**Phase 1 — Auth Service: Complete**

The authentication service is fully built, tested, and running. Registration, email verification, login, token refresh, protected routes, and logout are all working end to end.

---

## Architecture

### Monorepo Structure

```
drivelink/
├── apps/                        # Frontend applications (web, mobile — upcoming)
├── services/
│   └── auth-service/            # Authentication microservice (complete)
├── packages/
│   ├── types/                   # Shared TypeScript interfaces and enums
│   └── schemas/                 # Shared Zod validation schemas
├── docker-compose.yml           # Redis for local development
├── package.json                 # Monorepo root
├── pnpm-workspace.yaml          # pnpm workspace config
├── turbo.json                   # Turborepo task config
└── tsconfig.base.json           # Shared TypeScript config
```

### Tech Stack

| Layer               | Technology                                |
| ------------------- | ----------------------------------------- |
| Language            | TypeScript 5.9                            |
| Runtime             | Node.js 24                                |
| Package Manager     | pnpm 10 (workspaces)                      |
| Build Orchestration | Turborepo                                 |
| Web Framework       | Express                                   |
| Database            | PostgreSQL (Postgres.app locally)         |
| Cache / Sessions    | Redis (Docker)                            |
| ORM                 | Prisma 6                                  |
| Validation          | Zod                                       |
| Authentication      | JWT (access + refresh token rotation)     |
| Password Hashing    | bcryptjs (cost factor 12)                 |
| Email               | SendGrid (console logging in development) |

---

## Roles

| Role     | Description                                   |
| -------- | --------------------------------------------- |
| `CLIENT` | Hires vehicles from drivers                   |
| `DRIVER` | Lists and manages vehicles, handles handovers |
| `ADMIN`  | Platform administration, KYC verification     |

---

## Auth Service

### Endpoints

| Method | Route                    | Auth      | Description                                  |
| ------ | ------------------------ | --------- | -------------------------------------------- |
| POST   | `/auth/register`         | Public    | Create account, sends email OTP              |
| POST   | `/auth/verify-email`     | Public    | Verify email with OTP                        |
| POST   | `/auth/resend-email-otp` | Public    | Resend email OTP                             |
| POST   | `/auth/send-phone-otp`   | Public    | Send phone verification OTP                  |
| POST   | `/auth/verify-phone`     | Public    | Verify phone with OTP                        |
| POST   | `/auth/login`            | Public    | Login, returns access and refresh tokens     |
| POST   | `/auth/refresh`          | Public    | Rotate refresh token, issue new access token |
| POST   | `/auth/logout`           | Protected | Blacklist access token, revoke refresh token |
| GET    | `/auth/me`               | Protected | Get current user profile                     |
| GET    | `/health`                | Public    | Service health check                         |

### Token Strategy

**Access Token** — JWT, signed with `JWT_ACCESS_SECRET`, expires in 15 minutes. Stateless — verified by signature alone. Carries user ID, roles, and a unique `jti` for blacklisting.

**Refresh Token** — JWT, signed with `JWT_REFRESH_SECRET`, expires in 7 days. Stored in Redis. Rotated on every use — old token is deleted immediately, new token issued. Revoked on logout.

**OTPs** — 6-digit codes stored in Redis with a 10 minute TTL and a maximum of 5 attempts. Deleted on successful verification.

### Auth Service File Structure

```
services/auth-service/
├── prisma/
│   └── schema.prisma            # User model, Role and KycStatus enums
├── src/
│   ├── config/
│   │   └── index.ts             # Zod-validated environment config
│   ├── controllers/
│   │   └── auth.controller.ts   # Thin HTTP layer
│   ├── lib/
│   │   ├── AppError.ts          # AppError class and Errors factory
│   │   ├── jwt.ts               # Sign and verify access/refresh tokens
│   │   ├── mailer.ts            # SendGrid (console log in development)
│   │   ├── otp.ts               # OTP generation, storage, verification
│   │   ├── prisma.ts            # PrismaClient singleton
│   │   └── redis.ts             # ioredis singleton and key builders
│   ├── middleware/
│   │   ├── authenticate.ts      # JWT verification, blacklist check, requireRole
│   │   ├── errorHandler.ts      # Global error handler and asyncHandler wrapper
│   │   └── validate.ts          # Zod request body validation
│   ├── routes/
│   │   └── auth.routes.ts       # Route definitions
│   ├── services/
│   │   └── auth.service.ts      # Business logic
│   ├── app.ts                   # Express app factory
│   └── index.ts                 # Entry point, graceful shutdown
├── .env.example                 # Environment variable template
├── package.json
└── tsconfig.json
```

---

## Shared Packages

### `@drivelink/types`

TypeScript interfaces and enums shared across all services and apps.

- `Role` enum — CLIENT, DRIVER, ADMIN
- `KycStatus` enum — PENDING, APPROVED, REJECTED
- `OtpType` enum
- `User`, `AuthTokens`, `AuthResponse`, `ApiError` interfaces
- Request payload types — `RegisterPayload`, `LoginPayload`, etc.

### `@drivelink/schemas`

Zod schemas for request validation, derived from `@drivelink/types`.

- `RegisterSchema`, `LoginSchema`, `VerifyEmailSchema`
- `VerifyPhoneSchema`, `SendPhoneOtpSchema`, `RefreshTokenSchema`

---

## Local Development Setup

### Prerequisites

- Node.js 24+
- pnpm 10+
- Docker Desktop
- Postgres.app (macOS)

### Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/Pietrols/Drivelink.git
cd drivelink
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Build shared packages**

```bash
pnpm --filter @drivelink/types build
pnpm --filter @drivelink/schemas build
```

**4. Set up environment variables**

```bash
cp services/auth-service/.env.example services/auth-service/.env
# Fill in JWT secrets and other values
```

**5. Start Redis**

```bash
docker compose up -d
```

**6. Start Postgres.app**

Open Postgres.app and ensure it is running on port 5432. Then create the database:

```bash
psql -U postgres -c "CREATE USER drivelink WITH PASSWORD 'your_password';"
psql -U postgres -c "CREATE DATABASE drivelink_db OWNER drivelink;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE drivelink_db TO drivelink;"
```

**7. Push the database schema**

```bash
cd services/auth-service
pnpm db:push
```

**8. Start the auth service**

```bash
pnpm dev
```

The service runs on `http://localhost:3001`.

### Environment Variables

See `services/auth-service/.env.example` for all required variables. Key ones:

```bash
DATABASE_URL="postgresql://drivelink:password@localhost:5432/drivelink_db"
REDIS_URL="redis://:password@localhost:6379"
JWT_ACCESS_SECRET="64-byte-hex-string"
JWT_REFRESH_SECRET="64-byte-hex-string"
```

Generate JWT secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Commit History

| Commit                                                           | Description                                        |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| `chore: initialise monorepo scaffold`                            | Root package.json, pnpm workspace, turbo, tsconfig |
| `feat: add @drivelink/types shared package`                      | Shared TypeScript interfaces and enums             |
| `feat: add @drivelink/schemas shared package`                    | Shared Zod validation schemas                      |
| `chore: add auth service scaffold and gitignore`                 | Auth service directory structure                   |
| `feat: add auth service lib utilities`                           | prisma, redis, jwt, otp, mailer, AppError          |
| `fix: align prisma versions and guard sendgrid dynamic import`   | Prisma 6 alignment, dynamic SendGrid import        |
| `feat: add auth service middleware`                              | validate, authenticate, errorHandler               |
| `feat: add auth service layer, controller and routes`            | Business logic, HTTP layer, route definitions      |
| `feat: add auth service app setup and entry point`               | Express app factory, graceful shutdown             |
| `chore: add docker compose for local development infrastructure` | Redis container                                    |

---

## Upcoming — Phase 1 Remaining

- Booking service — vehicle listings, bookings, dual-confirm handover
- Web app — React frontend matching the DriveLink design system
- Mobile app — React Native (iOS and Android)

---

## Design Decisions

**Express over other frameworks** — chosen for language unification (full TypeScript stack), real-time suitability, and ecosystem fit.

**Prisma 6** — pinned to version 6 to avoid breaking changes in version 7.

**No transporter role** — vehicle handover is handled directly between driver and client via consent-based location sharing and in-app booking chat.

**Dual-confirm handover** — both driver and client must confirm pickup and return independently before booking state advances.

**Soft deletes** — users are never hard deleted. The `deletedAt` field allows account recovery and maintains referential integrity.

**Monorepo** — shared packages ensure type safety across service boundaries. A change to `@drivelink/types` surfaces TypeScript errors in every consuming service immediately.
