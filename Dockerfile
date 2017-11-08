FROM node:8-alpine

RUN apk update && apk add bash && apk add findutils && rm -rf /var/cache/apk/*
RUN mkdir -p /app/qlik/outhaul
WORKDIR /app/qlik/outhaul

COPY package.json ./
RUN npm install --production --quiet
COPY src src/
COPY adapters adapters/

# Run npm install on all adapters containing a package.json
RUN find ./adapters/* -maxdepth 2 -name package.json -execdir npm install \;

CMD ["npm", "start", "--silent"]
