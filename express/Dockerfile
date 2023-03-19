FROM node:16.19-alpine3.16

WORKDIR /usr/src/app

COPY /express/package.json .

RUN npm install

COPY /express .

CMD ["npm","start"]