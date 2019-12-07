FROM node:11-alpine as ui

# TODO Ignore env and google api creds json file

WORKDIR /usr/src/app
COPY interfaces ./interfaces

# Install deps first for more efficient caching
WORKDIR /usr/src/app/ui
COPY ui/package.json ui/yarn.lock ./
RUN yarn install

# Build UI
COPY ui .
RUN yarn build
WORKDIR /usr/src/app

FROM node:11-alpine as api

WORKDIR /usr/src/app
COPY interfaces ./interfaces

# Install api deps
WORKDIR /usr/src/app/newsroom-api
COPY newsroom-api/package.json newsroom-api/yarn.lock  ./
RUN yarn install

# Build API
COPY newsroom-api .
RUN yarn build
COPY --from=ui /usr/src/app/ui/dist dist/public

ENV NODE_ENV prod
ENV SERVICE_PORT 8000
EXPOSE 8000
CMD node .