FROM node:14-alpine3.14
RUN npm i -g cdk && npm install

WORKDIR /app
