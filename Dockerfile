FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Faz a API apontar para rotas relativas (/api), que o Nginx roteia para o backend
ENV VITE_API_URL=""
RUN npm run build && ln -sf /app/dist/server/index.js /app/dist/server/server.js

EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
