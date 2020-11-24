FROM node:12.18-stretch
LABEL maintainer="gs-w_eto_eb_federal_employees@usgs.gov"

RUN apt-get update && apt-get install -y --no-install-recommends \
    firefox-esr && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /assets

COPY package.json .
COPY package-lock.json .
ARG npm_args

RUN npm $npm_args install

COPY . /assets
