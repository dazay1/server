# Uses node version 22 as our base image
FROM node:22

# Goes to the app directory in the container
WORKDIR /app

# Copies package.json and package-lock.json to the container
COPY package*.json ./

# Installs the dependencies in the container
RUN npm install

# Copies the rest of the application code to the container
COPY . .

# Set port environment variable
ENV PORT=5000
# Exposes port 5000 to the outside world
EXPOSE 5000

# Starts the application
CMD ["npm", "start"]

