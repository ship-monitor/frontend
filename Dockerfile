FROM node:26-alpine AS build-stage
ENV VITE_API_URL=http://157.22.206.199:8080

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npm run build

FROM nginx:1.31-alpine-slim AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
