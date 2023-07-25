FROM node:latest

ARG HOST=0.0.0.0
ENV HOST $HOST

ARG PORT=3000
ENV PORT $PORT

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

CMD [ "npm", "start" ]
EXPOSE 3000
