FROM node:16-alpine as builder

COPY packages/*/package* ./packages/*/
COPY apps/*/package* ./apps/*/
COPY package* ./
RUN npm ci

COPY packages packages
COPY apps/otakudesu apps/otakudesu
RUN npm run build -ws --if-present

RUN npm run -w @meowvie-collector/otakudesu start