FROM node:latest

COPY podcaster ./podcaster/
RUN npm install

COPY package.json config.json feed_defaults.json ./

CMD [ "node", "./podcaster/app.js" ]

