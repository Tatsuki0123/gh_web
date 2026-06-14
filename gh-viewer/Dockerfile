FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy the built React app to Nginx's web server directory
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 for Cloud Run (Cloud Run sets the PORT env var, but defaults to 8080. We'll use a custom nginx config to listen on PORT)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Modify nginx configuration to listen on $PORT, not 80
# The default nginx configuration listens on 80. Cloud Run sets the PORT environment variable (default 8080).
# We will substitute $PORT using envsubst before starting Nginx.
CMD sh -c "envsubst '\\$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
