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

"use strict";

var util = require("util");
var fs = require("fs");

var config;
var PFuncs = require("./PatternFuncs");

// JSON cache for files that need to be written
var dirty = [];

// Set the default port, can be changed with the -p flag
var port = 8001;

// Flag to not start a new file write promise if one is already pending
var fileWritePromiseFlag = false;

if (process.argv.indexOf("-h") != -1) {
  usage();
  process.exit(1);
}

if (process.argv.indexOf("-c") != -1) {
  if (process.argv[process.argv.indexOf("-c") + 1] != -1) {
    var configFile = "./" + process.argv[process.argv.indexOf("-c") + 1];
    console.log("Using config file: " + configFile);
    try {
      config = require(configFile);
    } catch (err) {
      console.log("Error opening " + configFile + ": " + err);
      config = null;
    }
  } else {
    console.log("Option -c requires an argument!");
  }
}

if (process.argv.indexOf("-p") != -1) {
  if (process.argv.indexOf("-s") == -1) {
    console.log(
      "Option -p is only effective with the -s switch to start the server."
    );
  } else {
    if (process.argv[process.argv.indexOf("-p") + 1] != -1) {
      if (process.argv[process.argv.indexOf("-p") + 1].match(/^[1-9][0-9]*$/)) {
        port = process.argv[process.argv.indexOf("-p") + 1];
      } else {
        console.log("Option -p requires a numeric argument!");
      }
    } else {
      console.log("Option -p requires an argument!");
    }
  }
}

if (!config) {
  console.log("Using default config: ./config.js");
  config = require("./config");
}

if (process.argv.indexOf("-s") != -1) {
  startServer(config.RedFishData.path);
}

function startServer(redfishPath) {
  var express = require("express");
  var app = express();

  app.use("/redfish", express.static(redfishPath, { index: "index.json" }));

  console.log("Server starting on port: " + port);

  app.listen(port);
}

var patternTimers = [];

config.MockupData.MockupPatterns.forEach(function(mockup, index) {
  var p = new PFuncs();

  if (!typeof p[mockup.pattern]) {
    console.log(
      "Pattern '" +
        mockup.pattern +
        "' not implemented! Skipping " +
        mockup.name +
        "."
    );
    return;
  }

  if (!patternTimers[index]) patternTimers[index] = {};

  if (mockup.min) {
    console.log("Min: ", mockup.min);
    p.min = mockup.min;
  }
  if (mockup.max) {
    console.log("Max: ", mockup.max);
    p.max = mockup.max;
  }
  if (mockup.step) {
    console.log("Step: ", mockup.step);
    p.step = mockup.step;
  }
  if (mockup.center) {
    console.log("Center: ", mockup.center);
    p.center = mockup.center;
    p.value = mockup.center;
  }

  patternTimers[index].pfuncs = p;

  patternTimers[index].timer = setInterval(function() {
    var isoDTG = new Date().toISOString();
    isoDTG = isoDTG.replace(/\..*$/, "-0500");

    var currFile = mockup.path + "index.json";
    if (!(currFile in dirty)) {
      try {
        dirty[currFile] = JSON.parse(
          fs.readFileSync(config.RedFishData.path + currFile, "utf-8")
        );
      } catch (err) {
        console.log(
          "Error opening " + config.RedFishData.path + currFile + ": " + err
        );
      }
    } else {
      console.log(currFile + " found in dirty cache.");
    }

    var templateJSON = JSON.stringify(mockup.MetricValueTemplate);

    templateJSON = templateJSON.replace(
      /#value/g,
      patternTimers[index].pfuncs[mockup.pattern]()
    );
    templateJSON = templateJSON.replace(/#timestamp/g, isoDTG);

    var template = JSON.parse(templateJSON);

    var tmpMVs = dirty[currFile].MetricValues.filter(function(mval) {
      return (
        mval.MemberID !== template.MemberID ||
        mval.MetricProperty !== template.MetricProperty
      );
    });

    dirty[currFile].MetricValues = tmpMVs;

    dirty[currFile].MetricValues.push(template);

    console.log(
      isoDTG +
        ": " +
        mockup.name +
        "(" +
        patternTimers[index].pfuncs.value +
        ")"
    );
  }, mockup.timedelay * 1000);
});

var writeDirtyFilesTimer = setInterval(function() {
  var promises = [];

  console.log("Dirty files: " + Object.keys(dirty));

  if (Object.keys(dirty).length == 0) {
    return;
  }

  if (fileWritePromiseFlag == true) {
    return;
  }

  Object.keys(dirty).forEach(function(fileName) {
    promises.push(
      new Promise((resolve, reject) => {
        fs.writeFile(
          config.RedFishData.path + fileName,
          JSON.stringify(dirty[fileName], null, "\t"),
          "utf-8",
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
        console.log(fileName + " written.");
      })
    );
  });

  fileWritePromiseFlag = true;
  Promise.all(promises)
    .then(() => {
      dirty = [];
      fileWritePromiseFlag = false;
    })
    .catch(err => {
      console.log(">> Error: " + err);
    });
}, 1000);

function usage() {
  console.log(`Usage:

node jsModelServer [options]

Options:
  -c file   Change from the default config.js config file
  -h        Print the usage and exit
  -p port   Change from the default port of 8001
  -s        Start the server to serve out the redfish API
`);
}
