FROM node:18-alpine AS base

WORKDIR /app

COPY backend/package*.json ./
# Install only production dependencies
RUN npm install --production

COPY backend .

ENV PORT=3001
EXPOSE 3001

CMD ["node", "index.js"]