# File-Connectivity-Service

[![CircleCI](https://circleci.com/gh/qlik-ea/core-file-connectivity-service.svg?style=shield&circle-token=55d7bdfc4f3827e260a2e3480dbd64eab52417c0)](https://circleci.com/gh/qlik-ea/core-file-connectivity-service)

## Overview
File-Connectivity-Service is a service built to simplify accessing data sources. Connection providers are registered with the File-Connectivity-Service and in return a unique HTTP endpoint is defined. The unique HTTP endpoint is used to access the data source. This solution enables the QIX Engine to access a wide range of different data sources using the built in web file connectivity. Another advantage is that the connectivity providers can be hosted on a different host than the QIX Engine.

### Connection providers
The main purpose of the connection provider is to access a data source. The data from the source can be of any kind but the connection provider needs to transform it to a tabular format suited for QIX Engine, csv, xlsx among others. If the source data is in a tabular format then the connection provider should return as is.

This is the workflow
<img src="./docs/images/flow.png" width="500">

1. A new connection is added to the File-Connectivity-Service with a post `/connections`.
2. A URL to that includes a unique guid is returned (`/connections/guid`).
3. The received URL is used to create a new webfileconnection in QIX Engine.
4. When doReload is called on the QIX engine the connection URL is called and the data is fetched from the data source through the connection provided with a get `/connections/guid` request.

Another usage for the connection provider is to preprocess the data by transforming and cleansing it, this can reduce complexity of the load script.

### Example
An end to end example loading data from Dropbox can be found [here](./examples/README.md). 

### Generating the OpenAPI Specification

File-Connectivity-Service's REST API is specified in the [api-doc.yml](./docs/api-doc.yml) [OpenAPI](https://www.openapis.org/) document. The OpenAPI specification is generated from JSDoc by running:

```sh
npm run generate-openapi
```

### Authentication

The connection provider is responsible for handling authentication. File-Connectivity-Service will define the required authentication HTTP endpoint needed by its connection providers, like OAuth2. It is worth noticing that data sources that enforces OAuth2 authentication needs users to interact through a browser to fill in credentials like username and password and can be hard to automate. It is recommended to use API keys instead of OAuth2 to programmatically access the data.

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

## Security disclaimer
The File-Connectivity-Service is an example implementation and not something that is production ready in regards to security.
The communication is not encrypted with SSL and all the communication is in plain text and can be intercepted. This doesn't cause any problem if the service is running and interacting with the QIX Engine on the same host.
It is recommended that all connection are added right before a reload and removed right after, this is crucial since the data is fully exposed while the connection is available.

## Contributing

Contributions are welcome and encouraged! See more info at [Open Source at Qlik R&D](https://github.com/qlik-oss/open-source).

## Development

### Editor/IDE Configuration

No particular editor or IDE is assumed. The repo root contains an [.editorconfig](./.editorconfig) file for editors that support it. If not, make sure that the used editor is configured accordingly.

### Coding Guidelines

JavaScript code shall be developed according the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

The [.eslintrc.json](./.eslintrc.json) file incorporates these rules with minor modifications.

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
