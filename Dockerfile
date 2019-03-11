FROM node:latest

COPY podcaster ./podcaster/
COPY package.json ./

RUN npm install

CMD [ "node", "./podcaster/app.js" ]

