# Base image
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Copy application files
COPY package*.json ./
COPY . .

# Install dependencies
RUN npm install

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
