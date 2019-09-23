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

const request = require("request");
const fs = require("fs");
const _ = require("lodash");
const Influx = require("influx");

const childProcess = require("child_process");
const config = require("../config/config");

const PFuncs = require("../../rfModeller/PatternFuncs");

var generatorProcess = { process: null, perc: 0 }; //Global reference to generator child process

let influx = require("./InfluxController").influx;
let util = require("../resources/js/util");

let selections = require("../metrics_config.json");

let options = {
  host: "http://127.0.0.1:8001",
  redfish_defs: "/redfish/v1/TelemetryService/MetricReportDefinitions"
};

let def_path = `${options.host}${options.redfish_defs}`;

// Render Static Panels in Grafana
exports.getPanels = function(req, res) {
  res.render("index.hbs", {
    pageTitle: "Redfish Insight",
    currentYear: new Date().getFullYear()
  });
};

exports.getDefinitionCollection = function(req, res) {
  request(
    {
      url: def_path,
      json: true
    },
    (error, response, body) => {
      if (!body) {
        res.status(404);
        res.json({
          error: "Could not retrieve metrics"
        });
      } else if (error) {
        console.log(error);
      } else {
        let metrics = [];
        for (var i = 0; i < body.Members.length; i++) {
          let uri = body.Members[i]["@odata.id"];
          metrics.push(uri.split("/")[uri.split("/").length - 1]);
        }
        res.json(metrics);
      }
    }
  );
};

exports.getLanding = function(req, res) {
  res.render("landing.hbs", {
    pageTitle: "Redfish Insight"
  });
};

// Currently being used for the landing page.
exports.getAvailableMetrics = function(req, res) {
  var host = decodeURIComponent(req.params.host);
  // console.log(host);
  request(
    {
      url: `${host}${options.redfish_defs}`,
      //   url: def_path,
      json: true
    },
    (error, response, body) => {
      if (!body) {
        res.status(404);
        res.json({
          error: "Could not retrieve metrics"
        });
      } else if (error) {
        console.log(error);
      } else {
        let metrics = [];
        for (var i = 0; i < body.Members.length; i++) {
          let uri = body.Members[i]["@odata.id"];
          metrics.push(uri.substr(53, uri.length));
        }
        // console.log(metrics);
        res.json(metrics);
      }
    }
  );
};

// Route handler for /metrics/:metric
// Note: the mockup server isn't sending proper HTTP responses for
// bad requests. This is why !body is checked after the request is made.
exports.getMetric = function(req, res) {
  let metric = req.params.metric;
  // console.log(typeof metric);
  request(
    {
      url: `${def_path}/${metric}`,
      json: true
    },
    (error, response, body) => {
      if (!body) {
        res.status(404);
        res.json({
          error: "Metric does not exist",
          metric: metric
        });
      } else if (error) {
        console.log(error);
      } else {
        res.json(body);
      }
    }
  );
};

//Route handler for /dataGenerator
exports.getDataGenerator = function(req, res) {
  res.render("rfModeller.hbs", {
    configPath: "Config files located at: " + fs.realpathSync("../rfModeller/"),
    currentYear: new Date().getFullYear(),
    pageTitle: "Redfish Modeler"
  });
};

exports.generateMockData = function(req, res) {
  var q = [];

  //for ajax call to get percentage complete
  if (req.query.perc) {
    res.writeHead(200, { "Content-Type": "application/json" });
    if (generatorProcess.process != null) {
      res.end("" + generatorProcess.perc);
    } else {
      res.end("100");
    }
    return;
  }

  //if not a percentage call, start the generator
  if (req.query.time) q.push("-t", req.query.time);
  if (req.query.config) q.push("-c", req.query.config);
  if (req.query.interval) q.push("-i", req.query.interval);
  function generate(path, callback) {
    generatorProcess.process = childProcess.fork("rfModeller.js", q, {
      cwd: path
    });

    generatorProcess.perc = 0;
    var invoked = false;

    // listen for errors
    generatorProcess.process.on("error", function(err) {
      if (invoked) return;
      invoked = true;
      callback(err);
    });

    //update perc variable when received from child process
    generatorProcess.process.on("message", msg => {
      generatorProcess.perc = parseInt(msg);
    });

    // execute the callback
    generatorProcess.process.on("exit", function(code) {
      generatorProcess.process = null;
      if (invoked) return;
      invoked = true;
      var err = code === 0 ? null : new Error("exit code " + code);
      callback(err);
    });
  }

  generate("../rfModeller/", function(err) {
    if (!err) {
      res.download("../rfModeller/output.csv");
    } else {
      console.log(err);
    }
  });
};

/*
* Updates host in memory.
* TODO: Update host before anything else happens.
*/
exports.postRedfishHost = function(req, res) {
  console.log(`Host POST: ${JSON.stringify(req.body, undefined, 3)}`);
  let body = req.body;
  if (body) {
    let host = body.host;
    updateHost(host);
    res.json(body);
  } else {
    console.log("Host not updated...");
    res.json({
      error: "POST body should only contain attribute 'host'"
    });
  }
};

// TODO - this isn't actually doing anything at the moment.
// We need it to update some data so the app knows what to
// get and send to Influx.
exports.postSelectedMetrics = function(req, res) {
  console.log(`Metrics POST: ${JSON.stringify(req.body, undefined, 3)}`);
  let selectedMetrics = req.body;
  if (!_.isEmpty(selectedMetrics.payload)) {
    console.log(selectedMetrics.payload);
    _.forOwn(selectedMetrics.payload, (val, key) => {
      // patchMetricToEnabled(key);
    });
    // TODO FIX UPDATECONFIG
    updateConfig(selectedMetrics.payload);

    res.json(selectedMetrics);
  } else {
    res.json({
      error: "Bad Format"
    });
  }
};

exports.save = function(req, res) {
  console.log(`Metrics POST: ${JSON.stringify(req.body, undefined, 3)}`);
  let selectedMetrics = req.body;
  if (!_.isEmpty(selectedMetrics.payload)) {
    console.log(selectedMetrics.payload);
    _.forOwn(selectedMetrics.payload, (val, key) => {
      // patchMetricToEnabled(key);
    });
    updateConfig(selectedMetrics.payload);

    res.json(selectedMetrics);
  } else {
    res.json({
      error: "Bad Format"
    });
  }
};

const updateConfig = newSelection => {
  let requested = JSON.parse(newSelection);
  fs.readFile("metrics_config.json", "utf8", (err, data) => {
    if (err) {
      throw err;
    } else {
      configData = JSON.parse(data);
      configData.enabledReports = [];
      configData.selections = [];
      for (var key in requested) {
        if (requested.hasOwnProperty(key)) {
          temp_obj = {
            from: "",
            metrics: []
          };
          // Update enabled reports
          configData.enabledReports.push(key);
          temp_obj.from = key;
          for (var i = 0; i < requested[key].length; i++) {
            temp_obj.metrics.push(requested[key][i]);
          }
          configData.selections.push(temp_obj);
        }
      }

      fs.writeFile(
        "metrics_config.json",
        JSON.stringify(configData, undefined, 3),
        "utf8",
        (err, data) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  });
};

/*
* Handler for front-end POST subscription type. If 'sub', it is set up
* to run the subscription workflow, which is currently working.
*/
exports.postSubType = function(req, res) {
  console.log(`Sub type POST: ${JSON.stringify(req.body, undefined, 3)}`);
  let selectedSubType = req.body;
  if (
    selectedSubType.type &&
    ["sse", "sub", "poll"].includes(selectedSubType.type)
  ) {
    if (selectedSubType.type === "sub") {
      subscribeToEvents();
    }
    res.json(selectedSubType);
  } else {
    res.json({
      error:
        "POST body must include property 'type'. Acceptable values: poll, sse, or sub"
    });
  }
};

/*
* This is the handler for events coming from Redfish service.
*/

exports.handleEventIn = function(req, res) {
  console.log("Received a metric report from Redfish service.");
  console.log(res.req.body);
  let mr = res.req.body;
  let values = mr.MetricValues;

  for (var i = 0; i < values.length; i++) {
    // This date arithmetic needs to be then + (now - then)
    now = new Date();
    then = new Date(values[i].Timestamp);
    offset = Math.abs(now.getTime() - then.getTime());
    input = new Date(then.getTime() + offset);

    // If the user has selected a particular metric, write it to Influx.
    if (isSelected(mr.Id, values[i].MetricId)) {
      influx
        .writePoints(
          [
            {
              measurement: mr.Id,
              tags: { MetricDefinition: values[i].MetricDefinition },
              fields: { [values[i].MetricId]: values[i].MetricValue },
              timestamp: input
            }
          ],
          {
            database: "metrics",
            precision: "s"
          }
        )
        .catch(err => {
          console.error(`Error writing data to Influx. ${err.stack}`);
        });
    }
  }
};

const isSelected = (definition, metric) => {
  delete require.cache[require.resolve("../metrics_config.json")];
  selections = require("../metrics_config.json");
  report_enabled = selections.enabledReports.includes(definition);
  metric_selected = null;
  allSelections = selections.selections;
  for (var i = 0; i < allSelections.length; i++) {
    if (allSelections[i].from == definition) {
      if (allSelections[i].metrics.includes(metric)) {
        metric_selected = true;
      }
    }
  }
  return report_enabled && metric_selected;
};

const subscribeToEvents = () => {
  /*
  * The post body for the subscription is based on the EventDestination
  * schema. A POST to redfish/v1/EventService/Subscriptions with this body
  * should result in a 201 response code. Verify POST success by doing a GET
  * on redfish/v1/EventService/Subscriptions.
  */
  request.post(
    {
      url: `${options.host}/redfish/v1/EventService/Subscriptions`,
      json: true,
      rejectUnauthorized: false,
      /*
      * See DMTF RMS github issue #53 for conversation regarding this format.
      */
      body: {
        EventFormatType: "MetricReport",
        EventTypes: ["MetricReport"],
        Destination: "http://localhost:8080/api/event_in"
      }
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      }
      // console.log(response);
    }
  );
};

exports.getCurrentConfig = function(req, res) {
  let configData;

  fs.readFile("metrics_config.json", "utf8", (err, data) => {
    if (err) {
      throw err;
    } else {
      configData = JSON.parse(data);
      res.json(configData);
    }
  });
};

exports.getRfModeller = function(req, res) {
  res.render("rfModeller.hbs", {
    pageTitle: "Redfish Modeller",
    currentYear: new Date().getFullYear()
  });
};

exports.getModellerConfig = function(req, res) {
  let modellerConfig;

  fs.readFile("../rfModeller/config.json", "utf8", (err, data) => {
    if (err) {
      throw err;
    } else {
      modellerConfig = JSON.parse(data);
      res.json(modellerConfig);
    }
  });
};

exports.getModellerPatterns = function(req, res) {
  let modellerPatterns;

  let p = new PFuncs();

  modellerPatterns = p.patternList;

  res.json(modellerPatterns);
};

exports.postModellerConfig = function(req, res) {
  console.log(`Modeller Config: ${JSON.stringify(req.body, undefined, 2)}`);
  let modellerConfig = req.body;

  fs.writeFile(
    "../rfModeller/config.json",
    JSON.stringify(modellerConfig, null, 2),
    "utf8",
    (err, data) => {
      if (err) {
        res.json({
          error: "Could not retrieve metrics: err"
        });
      } else {
        res.json(modellerConfig);
      }
    }
  );
};

const patchMetricToEnabled = report => {
  request.patch(
    {
      url: `${def_path}/${report}`,
      json: true,
      body: {
        // This is temporary and will need to be changed upon schema update.
        // Status.State is read-only.
        MetricReportDefinitionEnabled: true
      }
    },
    (error, response, body) => {
      // console.log(response);
    }
  );
};

const saveSelectionToDisk = selection => {
  let currentConfiguration = JSON.stringify(selection, undefined, 3);

  fs.writeFile(
    "metrics_config.json",
    currentConfiguration,
    "utf8",
    (err, data) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

const updateSubType = newSubType => {
  fs.readFile("metrics_config.json", "utf8", (err, data) => {
    if (err) {
      throw err;
    } else {
      configData = JSON.parse(data);
      configData.sub_method = newSubType;
      fs.writeFile(
        "metrics_config.json",
        JSON.stringify(configData, undefined, 3),
        "utf8",
        err => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  });
};

const updateHost = host => {
  options.host = host;
  def_path = `${options.host}${options.redfish_defs}`;
  console.log(options.host);
};
