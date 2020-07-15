FROM node:12-alpine as deps
WORKDIR /src

COPY package.json yarn.lock ./
RUN yarn

FROM node:12-alpine as base
WORKDIR /src

COPY . ./
COPY --from=deps /src/node_modules ./node_modules
RUN yarn build

FROM node:12-alpine
EXPOSE 3000
WORKDIR /usr/src/app

COPY --from=deps /src/node_modules ./node_modules
COPY --from=deps /src/package.json /src/yarn.lock ./
COPY --from=base /src/.next ./.next
COPY --from=base /src/public ./public

CMD [ "yarn", "start" ]