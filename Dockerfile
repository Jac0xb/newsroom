FROM node:10-alpine
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY documentation/package.json ./documentation/
COPY newsroom-api/package.json ./newsroom-api/
COPY orm/package.json ./orm/
RUN yarn install
COPY . .
RUN yarn workspaces run build
CMD cd $SERVICE && node .