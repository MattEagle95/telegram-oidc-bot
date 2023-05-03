FROM node:20-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ["package.json", "package-lock.json*", "./"]

USER node

RUN npm install

COPY --chown=node:node . .

RUN npm build

EXPOSE 3000

CMD [ "node", "dist/index.js" ]