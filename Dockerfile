# Use the official Nginx image
FROM nginx:alpine

# Copy your HTML, CSS, and JS files into the container
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80
