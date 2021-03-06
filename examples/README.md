## E2E Dropbox example

This example focus on how to load data from Dropbox using the file-connectivity-service.

Note that before you deploy, you must accept the [Qlik Core EULA](https://core.qlik.com/eula/) by setting the `ACCEPT_EULA` environment variable.

Start by cloning the file-connectivity-service repository with:
- `git clone https://github.com/qlik-oss/core-file-connectivity-service.git`
- `cd file-connectivity-service`
- `npm install`

Copy the file [`airports.csv`](https://github.com/qlik-oss/core-file-connectivity-service/blob/master/data/airports.csv) located in the `/data` folder to your Dropbox.

- Follow [this guide](https://www.dropbox.com/developers/reference/oauth-guide) and create a OAuth 2.0 application.
- The `Redirect URIs` should be the address to the `http://[host]:[port]/v1/oauth2/callback` running the service, for example: `http://localhost:3000/v1/oauth2/callback`
- Set the following environment variables in the terminal
    - `export DROPBOX_CLIENT_ID="your App key"`
    - `export DROPBOX_CLIENT_SECRET="your App secret"`
- Go to the `/examples` folder in the file-connectivity-service repository
- run `ACCEPT_EULA=yes docker-compose up -d --build`
- run `node ./dropbox`

The first 10 lines of the Airports table should be outputted in the console window.

GoogleDrive and OneDrive have similar workflow as the one described above and are supported in the file-connectivity-service.
