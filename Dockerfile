FROM node:8-alpine

WORKDIR /srv

COPY package.json yarn.lock ./
RUN yarn

COPY app.js ./
