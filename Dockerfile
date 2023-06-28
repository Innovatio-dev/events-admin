# Dockerfile description

# First the base image
FROM node:18

# Create and set the working directory
RUN mkdir -p /usr/src
WORKDIR /usr/src

# Copy the source files to the workdir
COPY . .

# Install the dependencies
RUN corepack enable
# RUN npm install
RUN pnpm install

# Build and start the app
# RUN npm run build
RUN pnpm build
EXPOSE 3000
# CMD ["pnpm", "run", "start"]
CMD ["node", "build/index.js"]