FROM node:16-alpine as builder

COPY packages packages
COPY apps apps
COPY package* ./
RUN npm ci

COPY packages packages
COPY apps/samehadaku apps/samehadaku
RUN npm run build -ws --if-present

CMD npm run -w @meowvie-collector/samehadaku start