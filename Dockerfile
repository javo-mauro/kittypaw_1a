# --- Etapa 1: Instalación de Dependencias ---
FROM node:20-slim AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
COPY apps/app_principal/package.json ./apps/app_principal/

# --- Etapa 2: Instalación de Dependencias ---
# Esta etapa solo se re-ejecuta si los package.json cambian
FROM base AS deps
WORKDIR /usr/src/app
RUN npm install

# --- Etapa 3: Construcción de la Aplicación ---
FROM node:20-slim AS builder
WORKDIR /usr/src/app
# Copiamos el código fuente primero
COPY . .
# Luego, copiamos las dependencias ya instaladas de la etapa anterior
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Ahora construimos la aplicación
RUN npm run build --workspace=app_principal

# --- Etapa 4: Imagen Final de Producción ---
FROM node:20-slim AS production
WORKDIR /usr/src/app
# Copiamos los package.json para poder instalar solo las dependencias de producción
COPY package.json ./
COPY apps/app_principal/package.json ./apps/app_principal/
# Instalamos solo las dependencias necesarias para producción
RUN npm install --omit=dev
# Copiamos los artefactos construidos desde la etapa 'builder'
COPY --from=builder /usr/src/app/apps/app_principal/dist ./apps/app_principal/dist

EXPOSE 3000
CMD ["npm", "start", "--workspace=app_principal"]