FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies (use package-lock if present)
COPY package*.json ./
# Ensure git is available for any deps and install all dependencies (including devDeps)
RUN apk add --no-cache git && npm ci

# Copy source and build (allow VITE_* env to be set at build time)
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
