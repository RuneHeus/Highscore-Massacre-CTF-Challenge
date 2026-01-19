FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY server ./server
COPY prisma ./prisma
COPY public ./public
COPY sandbox ./sandbox
COPY vite.config.js ./
COPY index.html ./

RUN npm run build
RUN npx prisma generate

USER node

EXPOSE 3000
CMD ["npm", "run", "server"]