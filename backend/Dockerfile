FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

RUN npm prune --omit=dev \
  && rm -rf node_modules/prisma node_modules/@prisma/config node_modules/deepmerge-ts \
  && npm cache clean --force

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/server.js"]
