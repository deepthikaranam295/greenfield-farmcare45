# Stage 1 — build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL is injected at build time so the bundle knows where the API lives.
# In production it should be your domain, e.g. https://yourdomain.com
ARG VITE_API_URL=https://yourdomain.com
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2 — serve
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback: all routes serve index.html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
