FROM node:latest

COPY podcaster ./podcaster/

COPY package.json config.json feed_defaults.json ./

RUN npm install

CMD [ "node", "./podcaster/app.js" ]