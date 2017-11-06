# Outhaul

[![CircleCI](https://circleci.com/gh/qlik-ea/outhaul.svg?style=shield&circle-token=55d7bdfc4f3827e260a2e3480dbd64eab52417c0)](https://circleci.com/gh/qlik-ea/outhaul)

## Overview

Outhaul is a reverse proxy for registering a custom connector service and retrieve a secure http endpoint.

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

### Circle CI

Linting, building and testing is part of a job pipeline in Circle CI, and is also a prerequisite for merging a PR to master.
