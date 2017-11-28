FROM node:8-alpine

RUN apk update && apk add bash && apk add curl && rm -rf /var/cache/apk/*
RUN mkdir -p /app/qlik/outhaul
WORKDIR /app/qlik/outhaul

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK CMD curl -fs http://localhost:3000/v1/health || exit 1

COPY package.json ./
RUN npm install --production --quiet
COPY src src/
COPY docs/api-doc.yml docs/

CMD ["npm", "start", "--silent"]
