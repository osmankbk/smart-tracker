FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

RUN npm install

COPY . .

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["npm", "run", "start:dev"]