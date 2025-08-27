FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --build-from-source bcrypt

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
