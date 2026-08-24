FROM node:26-alpine AS build-stage

ARG VITE_API_URL
ARG VITE_CMS_URL
ARG VITE_PLAUSIBLE_URL
ARG VITE_PLAUSIBLE_DOMAIN

RUN if [ -z "$VITE_API_URL" ]; then \
      echo "ERROR: VITE_API_URL build arg is required" >&2; exit 1; \
    fi

ENV VITE_API_URL=$VITE_API_URL \
    VITE_CMS_URL=$VITE_CMS_URL \
    VITE_PLAUSIBLE_URL=$VITE_PLAUSIBLE_URL \
    VITE_PLAUSIBLE_DOMAIN=$VITE_PLAUSIBLE_DOMAIN

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npm run build

FROM nginx:1.31-alpine-slim AS production-stage

COPY etc/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
