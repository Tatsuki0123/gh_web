FROM node:20-slim
COPY package*.json ./
RUN npm install --production
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm install typescript
RUN npx tsc
EXPOSE 3001
CMD ["node", "dist/index.js"]
