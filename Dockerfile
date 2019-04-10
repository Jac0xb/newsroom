FROM node:8-alpine
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY documentation/package.json ./documentation/
COPY document-api/package.json ./document-api/
COPY orm/package.json ./orm/
RUN yarn install
COPY . .
RUN yarn workspaces run build
CMD node $SERVICE