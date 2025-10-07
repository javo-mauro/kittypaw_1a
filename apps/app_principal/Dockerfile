# 1. Usar una imagen oficial de Node.js como base
FROM node:20-slim

# 2. Establecer el directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiar los manifiestos de paquetes de la raíz Y de los workspaces
# Esto es crucial para que npm entienda la estructura del monorepo
COPY package*.json ./
COPY apps/app_principal/package.json ./apps/app_principal/

# 4. Instalar TODAS las dependencias del monorepo
RUN npm install

# 5. Copiar todo el resto del código del proyecto
COPY . .

# 6. Exponer el puerto que usará la aplicación
EXPOSE 5000
