FROM node

ENV MONGO_DB_USERNAME=delta_admin \
    MONGO_DB_PASSWORD=delta_password

RUN mkdir -p /delta/nodeapp

COPY . /delta/nodeapp

WORKDIR /delta/nodeapp

RUN npm install

CMD ["node", "server.js"]