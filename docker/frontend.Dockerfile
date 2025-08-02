# Build stage
FROM node:18-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
# Install dependencies
RUN npm install
COPY frontend .
# Build the production-ready static files
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]