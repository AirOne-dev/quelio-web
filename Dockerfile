FROM php:8.2-apache

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
        libcurl4-openssl-dev \
        && \
    docker-php-ext-install curl && \
    rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite

# Configure PHP
RUN echo 'display_errors = On' >> /usr/local/etc/php/conf.d/error_reporting.ini && \
    echo 'error_reporting = E_ALL' >> /usr/local/etc/php/conf.d/error_reporting.ini

# Set working directory
WORKDIR /var/www/html

# Copy the dist directory (built application)
COPY dist/ /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
