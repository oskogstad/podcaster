FROM node:latest

COPY package.json config.json feed_defaults.json ./

RUN npm install

COPY podcaster ./podcaster/

CMD [ "node", "./podcaster/app.js" ]