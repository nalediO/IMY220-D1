FROM node:20

WORKDIR /omph

COPY package*.json ./
RUN npm install --legacy-peer-deps

WORKDIR /omph/Backend
COPY Backend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy entire project
WORKDIR /omph
COPY . .

ENV CHOKIDAR_USEPOLLING=true

EXPOSE 8080
EXPOSE 5000

RUN npm install --save-dev concurrently

CMD ["npx", "concurrently", "--kill-others-on-fail", "\"npm run start-frontend\"", "\"npm run start-backend\""]
