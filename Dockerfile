# Dockerfile

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy entire project
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Default command — can be overridden in docker-compose
CMD ["npm", "run", "dev"]
