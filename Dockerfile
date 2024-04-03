FROM node:latest

WORKDIR /home/sayantan/Documents/code/backend

# Copy package.json and package-lock.json separately to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build your application
RUN npm run build

# Expose the port your server listens on
EXPOSE 8080

# Command to start your server in detached mode
CMD ["sh", "-c", "node dist/index-local.js & tail -f /dev/null"]
