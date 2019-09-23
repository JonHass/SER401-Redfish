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

const GO_HOST = "https://Administrator:password@172.17.0.2:443";

exports.testGo = function(req, res) {
  request(
    {
      method: "GET",
      // Here we basically blindly accept all unauthorized endpoints, which
      // from a security standpoint isn't great. However for this use case,
      // that is, connecting to a simulation environment in a contained environment,
      // it's acceptable. For now.
      rejectUnauthorized: false,
      url: `${GO_HOST}/redfish/v1/TelemetryService/MetricReportDefinitions`,
      json: true
    },
    (err, response, body) => {
      if (!body) {
        console.log(err);
        res.status(404);
        res.json({
          error: "Error connecting to Sailfish."
        });
      } else {
        res.json(body);
      }
    }
  );
};
