FROM ubuntu:24.04

RUN apt-get update && \
    apt-get install -y apache2 php libapache2-mod-php && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80

CMD ["apachectl", "-D", "FOREGROUND"]
