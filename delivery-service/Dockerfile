FROM node:18
WORKDIR /app
COPY package*.json package-lock.json tsconfig.json ./
RUN npm install
COPY src/ ./src
EXPOSE 5003
CMD ["npm", "run", "dev"]