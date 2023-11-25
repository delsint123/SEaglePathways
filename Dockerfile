FROM node:18

WORKDIR /usr/src/app/server

COPY package*.json ./
RUN npm install
RUN npm install -D ts-node

COPY . .

EXPOSE 5000
CMD [ "npm", "run", "server" ]
