FROM node:18-alpine as development

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/

RUN npm config set fetch-timeout 600000
RUN npm config set fetch-retries 5

RUN npm install

COPY . .

RUN npm rebuild bcrypt --build-from-source

EXPOSE 8000

CMD ["npm", "run", "start"]