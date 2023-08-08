# Start with the official Node image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock first
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# If you have additional global installations, add them here. 
# For now, I'm assuming you don't, so I'm not adding any.

# Copy the rest of the application files
COPY . .

# Ensure Tailwind CSS and PostCSS are installed
RUN yarn add tailwindcss postcss autoprefixer

# Specify the command to run on container start
CMD [ "yarn", "next", "dev" ]