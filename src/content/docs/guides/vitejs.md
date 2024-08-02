---
title: ViteJS
description: ViteJS
---

## Introduction

Vite is a build tool that provides a fast and lean development experience for modern web projects. It offers lightning-fast startup and hot module replacement (HMR) and is designed to work seamlessly with modern JavaScript frameworks like React, Vue, and Svelte. Vite improves the development process by pre-bundling dependencies and using native ES modules in the browser.

You can find the official documentation for Vite [here](https://vitejs.dev/guide/).

## Configuration

### Dockerfile

```dockerfile title=Dockerfile
FROM cgr.dev/chainguard/nginx:latest

WORKDIR /usr/share/nginx/html
COPY dist .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
```

### Nginx configuration

```conf title=nginx.conf
# https://www.zeolearn.com/magazine/setting-caching-headers-for-a-spa-in-nginx-cache

server {
  listen       8080;
  server_name  localhost;
  root /usr/share/nginx/html;

  # X-Frame-Options is to prevent from clickJacking attack
  add_header X-Frame-Options SAMEORIGIN;
 
  # disable content-type sniffing on some browsers.
  add_header X-Content-Type-Options nosniff;
 
  # This header enables the Cross-site scripting (XSS) filter
  add_header X-XSS-Protection "1; mode=block";

  add_header Referrer-Policy "no-referrer-when-downgrade";
 
  # Enables response header of "Vary: Accept-Encoding"
  gzip_vary on;

  location /assets {
    try_files $uri $uri/;
    expires modified 1y;
    add_header Cache-Control "public";
    access_log off;
   }

  location / {
    try_files $uri $uri/ /index.html;
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
  }
}
```

### GitHub Actions Workflow

See [this](../workflow/) page.