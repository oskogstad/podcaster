FROM node:latest

COPY podcaster ./podcaster/
COPY package.json config.json feed_defaults ./

RUN npm install

CMD [ "node", "./podcaster/app.js" ]

