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
RUN npm install

# Copier le code et générer Prisma + build
COPY . .

RUN npx prisma generate
RUN npm run build

# Étape 2 : Image de prod
FROM node:22-alpine

WORKDIR /app

# Copier package.json pour installer les deps de production
COPY package*.json ./
RUN npm install --only=production

# Copier le build Next.js
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copier les fichiers de config nécessaires
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

CMD ["npm", "start"]
