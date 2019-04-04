const Influx = require("influx");

// const config = JSON.parse(require("../metrics_config.json"));

const influx = new Influx.InfluxDB({
  host: "localhost:8086",
  database: "metrics",
  username: "admin",
  password: "admin",

  /*
  * The schema will need to be dynamically created based on the metrics
  * that a user selects in the beginning (prior to hitting 'start').
  */

  /*
  * For now, the schema is statically designed for CPUSensor report.
  * We could have a service worker that would retrieve the template
  * depending on the desired report.
  */
  schema: [
    {
      measurement: "CPUSensor",
      fields: {
        temperature: Influx.FieldType.FLOAT,
        min_temperature: Influx.FieldType.FLOAT,
        max_temperature: Influx.FieldType.FLOAT,
        target_temperature: Influx.FieldType.FLOAT,
        power_consumption: Influx.FieldType.FLOAT,
        target_power: Influx.FieldType.FLOAT
      },
      tags: ["report, interval"]
    },
    {
      measurement: "ThermalStatus",
      fields: {
        Reading: Influx.FieldType.FLOAT,
        Health: Influx.FieldType.STRING,
        UpperCriticalThreshold: Influx.FieldType.FLOAT,
        UpperNonCriticalThreshold: Influx.FieldType.FLOAT,
        LowerCriticalThreshold: Influx.FieldType.FLOAT,
        LowerNonCriticalThreshold: Influx.FieldType.FLOAT
      },
      tags: ["MetricDefinition"]
    },
    {
      measurement: "SensorInfo",
      fields: {
        CurrentReading: Influx.FieldType.FLOAT,
        HealthState: Influx.FieldType.STRING
      },
      tags: ["MetricDefinition"]
    }
  ]
});

module.exports = {
  influx
};
