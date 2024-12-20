FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY .env ./
COPY .env.* ./
COPY src ./src
COPY bin ./bin

EXPOSE 5000

ENTRYPOINT ["node"]
CMD ["bin/www"]