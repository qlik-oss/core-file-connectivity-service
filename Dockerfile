FROM node:7-alpine
RUN apk update && apk add bash && rm -rf /var/cache/apk/*
RUN mkdir -p /app/qlik/outhaul
WORKDIR /app/qlik/outhaul
COPY package.json ./
RUN npm install --production --quiet
COPY . ./
CMD ["npm", "start", "--silent"]
