# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package dependencies and install them
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build-time environment variable to target the backend
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8000}

# Build production assets
RUN npm run build

# Stage 2: Serve the build assets using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration to support client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
