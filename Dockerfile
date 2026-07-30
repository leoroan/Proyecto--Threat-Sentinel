FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias primero (caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar el código fuente
COPY .env.example .env
COPY src/ src/

EXPOSE 3000

CMD ["node", "src/server.js"]