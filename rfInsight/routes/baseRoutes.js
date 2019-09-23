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

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const routes_controller = require("../controllers/RoutesController");
const test_controller = require("../controllers/TestController");

module.exports = (app, router) => {
  app.use(express.static("./resources"));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  /*
  * This set of routes represents the API service to the frontend.
  */
  router
    .route("/metrics")
    .get(routes_controller.getDefinitionCollection)
    .post(routes_controller.postSelectedMetrics);
  router.route("/event_in").post(routes_controller.handleEventIn);
  router.route("/sub_type").post(routes_controller.postSubType);
  router.route("/redfish_host").post(routes_controller.postRedfishHost);
  router.route("/save").post(routes_controller.save);
  router.route("/metrics/:metric").get(routes_controller.getMetric);
  router.route("/config").get(routes_controller.getCurrentConfig);
  router.route("/test").get(test_controller.testGo);
  router.route("/modeller_config").get(routes_controller.getModellerConfig);
  router.route("/modeller_config").post(routes_controller.postModellerConfig);
  router.route("/modeller_patterns").get(routes_controller.getModellerPatterns);
  app.use("/api", router);

  /*
  * These are actual application routes.
  */
  app.get("/graphs", routes_controller.getPanels);
  app.get("/datagenerator", routes_controller.getDataGenerator);
  app.get("/generateMockData", routes_controller.generateMockData);
  app.get("/rfModeller", routes_controller.getRfModeller);
  app.get("/", routes_controller.getLanding);
  app.get("/getDefs/:host", routes_controller.getAvailableMetrics);
  app.get("/:metric", routes_controller.getMetric);

  // This is a catchall for any bad request.
  app.all("*", function(req, res) {
    res.status(404);
    res.json({
      error: "Bad Request",
      method: req.method,
      code: 404,
      url: req.url
    });
  });
};
