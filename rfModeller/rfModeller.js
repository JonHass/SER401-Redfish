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
var PFuncs = require("./PatternFuncs");
var config;
var iterations = 60 * 60 * 10; //default to 10 hours unless specified otherwise
var outputPath = "./output.csv"; //default. override with -o switch
var interval = 10; //number of seconds to wait before producing a report
var newPerc = 0;

//-c switch to specify config file
if (process.argv.indexOf("-c") != -1) {
  if (process.argv[process.argv.indexOf("-c") + 1] != -1) {
    var configFile = "./" + process.argv[process.argv.indexOf("-c") + 1];
    //console.log("Using config file: " + configFile);
    try {
      config = require(configFile);
    } catch (e) {
      console.log("Error opening " + configFile + ": " + e);
      process.exit(10);
    }
  }
}

//look for -t time switch
if (process.argv.indexOf("-t") != -1) {
  if (process.argv[process.argv.indexOf("-t") + 1] != -1) {
    iterations = process.argv[process.argv.indexOf("-t") + 1];
  }
}

//look for -o time switch
if (process.argv.indexOf("-o") != -1) {
  if (process.argv[process.argv.indexOf("-o") + 1] != -1) {
    outputPath = process.argv[process.argv.indexOf("-o") + 1];
  }
}

//look for -i interval switch
if (process.argv.indexOf("-i") != -1) {
  if (process.argv[process.argv.indexOf("-i") + 1] != -1) {
    interval = process.argv[process.argv.indexOf("-i") + 1];
  }
}

//import config
if (!config) {
  try {
    config = require("./config");
  } catch (e) {
    console.log("Error opening default config: " + e);
    process.exit(10);
  }
}

generate();

function generate() {
  var patternTimers = [];
  var parsedPaths = []; //cached json template paths
  var parsedTemplates = []; //cached json templates
  var isoDTG = Date.now();
  var str = "#";
  var gcd = 0;
  var oldPerc = 0;
  var percLen = 50; //the length, in characters, of the percentage loading bar
  var stream = fs.createWriteStream(outputPath);
  stream.write("");

  //calculate GCD of iterations for iteration optimazation
  config.MockupData.MockupPatterns.forEach(function(mockup, index) {
    if (gcd == 0) gcd = mockup.timedelay;
    else gcd = getGCD(gcd, mockup.timedelay);
  });

  gcd = getGCD(gcd, interval); //need to ensure the loop checks on interval

  (async () => {
    for (var i = 0; i <= iterations; i += gcd) {
      //draw the percent loading bar
      newPerc = Math.floor((i / iterations) * 100);
      if (newPerc > oldPerc) {
        oldPerc = newPerc;
        if (!(process.send === undefined)) {
          process.send("" + newPerc); //send percentage to parent process
        } else {
          process.stdout.cursorTo(0);
          let percStr = "[";
          for (var x = 0; x < Math.floor((newPerc / 100) * percLen); x++) {
            percStr += "█";
          }

          for (
            var x = Math.floor((newPerc / 100) * percLen);
            x < percLen;
            x++
          ) {
            percStr += " ";
          }
          percStr += "]";
          percStr += newPerc + "%";

          process.stdout.write(percStr);
        }
      }

      //start with a fresh line
      var line = "";

      //iterate over mockup patterns defined in configuration file
      config.MockupData.MockupPatterns.forEach(function(mockup, index) {
        //only do anything if the current iteration is on the approriate time
        if (i % mockup.timedelay == 0) {
          //check if template has been parsed
          let path =
            "./" + config.RedFishData.path + mockup.path + "index.json";

          //if its not loaded yet, load and parse the template
          if (parsedPaths.indexOf(path) < 0) {
            try {
              var file = fs.readFileSync(path, "utf-8");
            } catch (e) {
              console.log("\nError opening template reports: " + e);
              console.log(
                "\nEnsure RedFishData.path property is correct in your specified config.js"
              );
              process.exit(11);
            }
            var currJSON = JSON.parse(file);
            //push template to loaded templates
            parsedTemplates.push(file);
            parsedPaths.push(path);
          } else {
            //or use the loaded one
            var currJSON = JSON.parse(
              parsedTemplates[parsedPaths.indexOf(path)]
            );
          }

          if (patternTimers[index] == undefined) patternTimers[index] = {};

          if (patternTimers[index].pfuncs == undefined) {
            var p = new PFuncs();
            if (mockup.min) {
              p.min = mockup.min;
            }
            if (mockup.max) {
              p.max = mockup.max;
            }
            if (mockup.step) {
              p.step = mockup.step;
            }
            patternTimers[index].pfuncs = p;
          }

          //parse JSON to string for replacement
          var templateJSON = JSON.stringify(mockup.MetricValueTemplate);

          //replace value string
          templateJSON = templateJSON.replace(
            /#value/g,
            patternTimers[index].pfuncs[mockup.pattern]()
          );

          //replace timestamp string
          templateJSON = templateJSON.replace(
            /#timestamp/g,
            new Date(isoDTG + i * 1000).toISOString().replace(/\..*$/, "-0500")
          );

          //parse back to object
          var template = JSON.parse(templateJSON);

          //build csv record
          line += currJSON.Name + ",";
          line += template.MemberID + ",";
          line += template.MetricValue + ",";
          line += template.TimeStamp + ",";
          line += template.MetricProperty + ",";
        }
      });
      if (i % interval == 0) {
        str += "\n";
        str += i + ",Metric,";
      }

      //if the line is not empty, add some boilerplate and add to master string
      if (line != "") {
        //str += ",";
        str += line;
      }

      //write to stream periodically to prevent memory overflow
      if (str.length > 1000000) {
        var res = write(stream, str);
        if (res instanceof Promise) await res;
        str = "";
      }
    }

    //wrap up
    str += "0,END";
    stream.write(str, function() {
      process.exit();
    });
  })();
}

///////////////
// FUNCTIONS //
///////////////

//find the greatest common denominator of 2 numbers
function getGCD(a, b) {
  if (b > a) {
    var temp = a;
    a = b;
    b = temp;
  }
  while (true) {
    if (b == 0) return a;
    a %= b;
    if (a == 0) return b;
    b %= a;
  }
}

//convert a number of seconds into a prettified string
function secondsToString(s) {
  var hours = Math.floor(s / 3600);
  s -= hours * 3600;
  var minutes = Math.floor(s / 60);
  s -= minutes * 60;
  return hours + " hours, " + minutes + " minutes, and " + s + " seconds";
}

//write data to stream
function write(stream, data) {
  //await stream drain to prevent overflow
  if (!stream.write(data)) {
    return new Promise(resolve => stream.once("drain", resolve));
  }
  return;
}
