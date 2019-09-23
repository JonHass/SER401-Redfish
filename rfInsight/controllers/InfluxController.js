/*
* Copyright 2018, 2019 Andrew Antes, Andrew Bossie, Justin Kistler,
* Wyatt Draggoo, Maigan Sedate
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

const Influx = require("influx");

const influx = new Influx.InfluxDB({
  host: "52.37.217.87:8086",
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
    },
    {
      measurement: "FanStatus",
      fields: {
        FQDD: Influx.FieldType.STRING,
        Status: Influx.FieldType.STRING,
        Type: Influx.FieldType.STRING,
        LowerWarningThreshold: Influx.FieldType.FLOAT,
        LowerCriticalThreshold: Influx.FieldType.FLOAT,
        CurrentSpeedRPM: Influx.FieldType.FLOAT
      },
      tags: ["MetricDefinition"]
    },
    {
      measurement: "FanInventory",
      fields: {
        FQDD: Influx.FieldType.STRING,
        RedundancyStatus: Influx.FieldType.STRING,
        RateUnits: Influx.FieldType.STRING,
        PrimaryStatus: Influx.FieldType.STRING,
        CurrentReading: Influx.FieldType.FLOAT
      },
      tags: ["MetricDefinition"]
    },
    {
      measurement: "PSUInventory",
      fields: {
        FQDD: Influx.FieldType.STRING,
        EffectiveCapacity: Influx.FieldType.FLOAT,
        RedundancyStatus: Influx.FieldType.STRING,
        Type: Influx.FieldType.STRING,
        PrimaryStatus: Influx.FieldType.STRING,
        TotalOutputPower: Influx.FieldType.FLOAT,
        DetailedState: Influx.FieldType.STRING,
        PartNumber: Influx.FieldType.STRING,
        SerialNumber: Influx.FieldType.STRING,
        Model: Influx.FieldType.STRING,
        LineInputVoltageType: Influx.FieldType.STRING,
        Name: Influx.FieldType.STRING,
        SparePartNumber: Influx.FieldType.STRING,
        LastPowerOutputWatts: Influx.FieldType.STRING
      },
      tags: ["MetricDefinition"]
    },
    {
      measurement: "PSUStatus",
      fields: {
        Present: Influx.FieldType.STRING,
        PrimaryStatus: Influx.FieldType.STRING,
        RedundancyStatus: Influx.FieldType.STRING,
        TotalOutputPower: Influx.FieldType.FLOAT
      },
      tags: ["MetricDefinition"]
    }
  ]
});

module.exports = {
  influx
};
