FROM node:16-alpine as builder

COPY packages packages
COPY apps apps
COPY package* ./
RUN npm ci

COPY packages packages
COPY apps/oploverz apps/oploverz
RUN npm run build -ws --if-present

CMD npm run -w @meowvie-collector/oploverz start