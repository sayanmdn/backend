FROM node:latest

# Install pm2 globally
RUN npm install pm2 -g

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

# Use the exec form of CMD to start pm2 with the server process
CMD ["pm2-runtime", "start", "dist/index-local.js"]
