# DEPRECATED

FROM node:14.18.0-alpine3.14 as nodebuild

WORKDIR /e2e


RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn

# Tell Puppeteer to skip installing Chrome when npm install'ing. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser


ENV PATH /e2e/node_modules/.bin:$PATH
ENV CI true

COPY package.json /e2e
COPY pnpm-lock.yaml /e2e
COPY . /e2e

ARG HEADLESS
ENV HEADLESS $HEADLESS

ARG FRONTEND_URL
ENV FRONTEND_URL $FRONTEND_URL
