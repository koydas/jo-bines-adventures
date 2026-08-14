# --- Build stage -------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage -------------------------------------------------------------
# nginx-unprivileged: already runs as uid 101 on an unprivileged port, so the
# Deployment's `runAsNonRoot`/`readOnlyRootFilesystem` securityContext (see
# k8s/deployment.yaml) doesn't need any capability grant to work.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

USER 101

COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
