# Étape 1 : Build l'application
FROM node:22-alpine AS builder

WORKDIR /app

# Définir les ARG pour le build
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG DATABASE_URL
ARG PORTFOLIO_API_TOKEN
ARG PORTFOLIO_API_URL
ARG RESEND_API_KEY

ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV DATABASE_URL=$DATABASE_URL
ENV PORTFOLIO_API_TOKEN=$PORTFOLIO_API_TOKEN
ENV PORTFOLIO_API_URL=$PORTFOLIO_API_URL
ENV RESEND_API_KEY=$RESEND_API_KEY

# Installer deps
COPY package*.json ./
RUN npm ci

# Copier le code et générer Prisma + build
COPY . .

RUN npx prisma generate
RUN npm run build

# Étape 2 : Image de prod
FROM node:22-alpine

WORKDIR /app

# Variables d'environnement pour le runtime
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG DATABASE_URL
ARG PORTFOLIO_API_TOKEN
ARG PORTFOLIO_API_URL
ARG RESEND_API_KEY

ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV DATABASE_URL=$DATABASE_URL
ENV PORTFOLIO_API_TOKEN=$PORTFOLIO_API_TOKEN
ENV PORTFOLIO_API_URL=$PORTFOLIO_API_URL
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV NODE_ENV=production
ENV PORT=3001

# Copier package.json
COPY package*.json ./

# Copier node_modules depuis le builder (contient déjà Prisma généré)
COPY --from=builder /app/node_modules ./node_modules

# Copier le build Next.js
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/app/generated ./src/app/generated
COPY --from=builder /app/prisma ./prisma

# Copier les fichiers de config nécessaires
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3001

CMD ["npm", "start"]
