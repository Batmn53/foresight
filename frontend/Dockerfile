FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server accessible from outside container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
