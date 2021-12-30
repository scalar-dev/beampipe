# build environment
FROM node:16.6.2-alpine as build
WORKDIR /app
COPY . .

ENV CI=true

RUN yarn
RUN yarn build
# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
