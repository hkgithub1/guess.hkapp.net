FROM node:15.13-alpine as webapp
WORKDIR /react
COPY /react/package.json .
RUN npm install
COPY /react .
RUN npm run build

FROM nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=webapp /react/dist /usr/share/nginx/html

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
