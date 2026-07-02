# ───── Stage 1: Composer deps ─────
FROM composer:2.8 AS vendor

WORKDIR /app

# Copy only manifests first untuk caching layer
COPY apps/api/composer.json apps/api/composer.lock ./
# Install dengan dev deps dulu supaya package:discover di dump-autoload
# bisa menemukan service provider seperti Pail. Image runtime akan jadi lebih
# besar beberapa MB tapi proses build lebih reliable. Bisa di-trim nanti.
RUN composer install \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction

# Copy rest of api source
COPY apps/api .

RUN composer dump-autoload --optimize

# ───── Stage 2: Runtime (PHP 8.4 FPM) ─────
FROM php:8.4-fpm-bookworm AS runtime

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        curl \
        unzip \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring gd zip bcmath

# Install Composer
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy prepared vendor + source
COPY --from=vendor /app /var/www/html

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port
EXPOSE 8000

# Entrypoint: jalankan migrate (jika perlu) lalu serve
COPY infra/docker/api/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]