FROM node:22-slim AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

# Install system dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install dependencies ────────────────────────
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/validation/package.json packages/validation/
COPY packages/config/package.json packages/config/
COPY packages/constants/package.json packages/constants/
COPY packages/utils/package.json packages/utils/

RUN pnpm install --frozen-lockfile

# ── Copy source code ────────────────────────────
COPY prisma ./prisma/
COPY packages/types ./packages/types/
COPY packages/validation ./packages/validation/
COPY packages/config ./packages/config/
COPY packages/constants ./packages/constants/
COPY packages/utils ./packages/utils/
COPY apps/api ./apps/api/
COPY tsconfig.base.json ./

# ── Generate Prisma Client ─────────────────────
RUN cd apps/api && npx prisma generate --schema=../../prisma/schema.prisma

# ── Environment ─────────────────────────────────
ENV NODE_ENV=production

EXPOSE 5000

# ── Start ───────────────────────────────────────
CMD ["node", "--import", "tsx", "apps/api/src/index.ts"]
