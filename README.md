# SER401-Redfish

## Capstone for SER401 - Redfish Telemetry Client

## Dependencies

### 1. InfluxDB

For this application, you will need InfluxDB installed locally or
remotely, such as on an AWS EC2 instance. The application is, by default,
configured for a locally-hosted InfluxDB.

Within InfluxDB, there must be a database created called "metrics." This is as
simple as, within the InfluxDB CLI, running `CREATE DATABASE metrics`

If you wish to change to a remote InfluxDB, you will need to change the
credentials located in /controllers/InfluxController.js lines 4-7. The
InfluxDB default login is U/N admin, P/W admin.

### 2. Grafana

In order to configure and view Grafana panels, the Grafana services needs to
be running locally or remotely. Grafana is a read-only service, therefore
once you connect to your datasource (InfluxDB) by creating a Data Source
within Grafana, setting up queries to Influx is simple.

When you install Grafana and run the service, it runs by default on port 3000.

NOTE: The panels within the app currently are sourced from a specific AWS IP address.
These panel links will need to be changed when a new Grafana instance is configured.
The location of the links is in `/views/index.hbs` lines 120 - 130. The embed links can
be obtained within Grafana by selecting the panel dropdown and selecting 'Share'.

## Running the application (development)

### 1. Install Node.js

https://nodejs.org/en/ - Navigate here and download and install the LTS version
(10.15.1 at this time).
This will install both Node as well as npm, the package manager that will be needed
to install other packages used by the application.

### 2. Download Git repository

`git pull https://github.com/andrewbossie/SER401-Redfish.git`

- Navigate to project directory (cd ./SER401-Redfish)
- Run `npm install` to install all necessary packages

### 3. Run application

- NOTE (Temporary) - to change target host, navigate to rfInsight/controllers/RoutesController
  - In RoutesController.js, change options.host to desired host (line 9-10)
- Start up the Redfish Mockup Server and ensure it's running on port 8001.
- Navigate to rfInsight directory and run `node index.js`.
- Navigate to `http://localhost:8080` in browser.
