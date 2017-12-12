# Outhaul

[![CircleCI](https://circleci.com/gh/qlik-ea/outhaul.svg?style=shield&circle-token=55d7bdfc4f3827e260a2e3480dbd64eab52417c0)](https://circleci.com/gh/qlik-ea/outhaul)

## Overview
Outhaul is a service built to simplify accessing data sources. Connection providers are registered in Outhaul and in return a unique HTTP endpoint is defined. The unique HTTP endpoint is used to access the data source. This solution enables the QIX Engine to access a wide range of different data sources using the built in web file connectivity. Another advantage is that the connectivity providers can be hosted on a different host than QIX Engine.

### Connection providers
The main purpose of the connection provider is to access a data source. The data from the source can be of any kind but the connection provider needs to transform it to a tabular format suited for QIX Engine, csv, xlsx among others. If the source data is in a tabular format then the connection provider should return as is.

This is the workflow
<img src="./docs/images/flow.png" width="500">

Another usage for the connection provider is to preprocess the data by transforming and cleansing it, this can reduce complexity of the load script.

Outhaul contains a number of predefined providers which are documented [here](./docs/strategies.md). These providers are also included in the docker container when building Outhaul.

### Generating the OpenAPI Specification

Outhauls's REST API is specified in the [api-doc.yml](./docs/api-doc.yml) [OpenAPI](https://www.openapis.org/) document. The OpenAPI specification is generated from JSDoc by running:

```sh
npm run generate-openapi
```

### Authentication

The connection provider is responsible for handling authentication. Outhaul will define the required authentication HTTP endpoint needed by its connection providers, like OAuth2. It is worth noticing that data sources that enforces OAuth2 authentication need lots of user involvement with sign in and can be hard to automate. It is recommended to use API keys instead of OAuth2 to programmatically access the data.

## Run

Environment variables for each connection provider's OAuth application needs to be populated before running with clientId and clientSecret:

```sh

export ONE_DRIVE_CLIENT_ID="your OAuth application client id"
export ONE_DRIVE_CLIENT_SECRET="your OAuth application client secret"
export DROPBOX_CLIENT_ID="your OAuth application client id"
export DROPBOX_CLIENT_SECRET="your OAuth application client secret"
export GOOGLE_DRIVE_CLIENT_ID="your OAuth application client id"
export GOOGLE_DRIVE_CLIENT_SECRET="your OAuth application client secret"
npm start
```

## Contributing

Contributions are welcome and encouraged! See more info at [Open Source at Qlik R&D](https://github.com/qlik-oss/open-source).

## Development

### Editor/IDE Configuration

No particular editor or IDE is assumed. The repo root contains an [.editorconfig](./.editorconfig) file for editors that support it. If not, make sure that the used editor is configured accordingly.

### Coding Guidelines

JavaScript code shall be developed according the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

The [eslintrc.json](./eslintrc.json) file incorporates these rules with minor modifications.

### Linting

To run linting locally run:

```sh
npm run lint
```

### Testing

Component tests can be run with:

```sh
npm run test:component
```

### CircleCI

Linting, building and testing is part of a job pipeline in CircleCI, and is also a prerequisite for merging a PR to master.
