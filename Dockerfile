FROM nginx:1.30.5-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/nginx /usr/share/nginx/html/k8s /usr/share/nginx/html/Dockerfile
