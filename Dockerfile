FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building if needed)
RUN npm ci

# Copy source code
COPY . .

# Create a simple start script that uses PORT env var
RUN echo 'node server.js' > /app/start.sh && chmod +x /app/start.sh

# Expose port (Railway will set PORT env var)
EXPOSE 3001

# Start the application
CMD ["/app/start.sh"]