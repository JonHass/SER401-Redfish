"use strict";

var util = require("util");
var fs = require("fs");
var config;
var PFuncs = require("./PatternFuncs");
var iterations = 60*60*10; //default to 10 hours unless specified otherwise

//-c switch to specify config file
if (process.argv.indexOf("-c") != -1) {
   if (process.argv[process.argv.indexOf("-c") + 1] != -1) {
      var configFile = "./" + process.argv[process.argv.indexOf("-c") + 1];
      console.log("Using config file: " + configFile);
      try {
         config = require(configFile);
      } catch (e) {
         console.log("Error opening " + configFile + ": " + e);
      }
   }
   
   //look for time switch
   if (process.argv[process.argv.indexOf("-t") + 1] != -1) {
      iterations = process.argv[process.argv.indexOf("-t") + 1]
   }
}

if (!config) {
   config = require("./config");
}


var patternTimers = [];
var parsedPaths = [];
var parsedTemplates = [];
var isoDTG = Date.now();
var str = "#\n";
var gcd = 0;

console.log("Generating " + secondsToString(iterations) + " of data... ");
fs.writeFileSync("data.csv", str); //empty file if it already exists



//calculate GCD of iterations for iteration optimazation
config.MockupData.MockupPatterns.forEach(function(mockup, index) {
	if (gcd == 0)
		gcd = mockup.timedelay;
	else
		gcd = getGCD(gcd,mockup.timedelay);
});



for (var i = 0; i <= iterations; i+=gcd) {
    var line = "";
    config.MockupData.MockupPatterns.forEach(function(mockup, index) {
        //only do anything if the current iteration is on the approriate time
        if (i % mockup.timedelay == 0) {
            
            //check if template has been parsed
            let path = config.RedFishData.path + mockup.path + "index.json";
            
            //if its not loaded yet, load and parse the template
            if(parsedPaths.indexOf(path) < 0){
                let file = fs.readFileSync(path,"utf-8")
                var currJSON = JSON.parse(file);
                //push template to loaded templates
                parsedTemplates.push(file);
                parsedPaths.push(path);
            }else{
                //or use the loaded one
                var currJSON = JSON.parse(parsedTemplates[parsedPaths.indexOf(path)]);
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


            var templateJSON = JSON.stringify(mockup.MetricValueTemplate);

            templateJSON = templateJSON.replace(
            /#value/g,
            patternTimers[index].pfuncs[mockup.pattern]()
            );

            templateJSON = templateJSON.replace(
            /#timestamp/g,
            new Date(isoDTG + i * 1000).toISOString().replace(/\..*$/, "-0500")
            );

            var template = JSON.parse(templateJSON);
            
            //build csv record
            line += currJSON.Name + ",";
            line += template.MemberID + ",";
            line += template.MetricValue + ",";
            line += template.TimeStamp + ",";
            line += template.MetricProperty + ",";
        }
    });
    
    //if the line is not empty, add some boilerplate and add to master string
    if (line != "") {
        str += i + ",";
        str += "Metric,";

        str += line;
        str += "\n";
        //lineNum++;
    }
}
str += "0,END";
fs.writeFileSync("data.csv", str);
console.log("Completed in " + (Date.now() - isoDTG) + "ms");

//find the greatest common denominator of 2 numbers
function getGCD(a,b) {
    if (b > a) {var temp = a; a = b; b = temp;}
    while (true) {
        if (b == 0) 
			return a;
        a %= b;
        if (a == 0) 
			return b;
        b %= a;
    }
}

//convert a number of seconds into a prettified string
function secondsToString(s) {
    var hours = Math.floor(s / 3600);
    s -= hours*3600;
    var minutes = Math.floor(s / 60);
    s -= minutes*60;
    return hours + " hours, " + minutes + " minutes, and " + s + " seconds";
}

