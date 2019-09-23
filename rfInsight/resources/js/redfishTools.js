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

/*
 * Retrieves a given metric from a given tray (if tray is applicable)
 * and returns the metric in [timestamp, metric] format.
 */
let getMetric = (metricValues, metric, tray, num) => {
  let data = {
    MemberID: "",
    MetricValue: "",
    TimeStamp: "",
    num: 0
  };

  for (var i = 0; i < metricValues.length; i++) {
    if (
      tray &&
      metricValues[i].MetricProperty.includes(`Tray_${tray}`) &&
      metricValues[i].MemberID === metric &&
      metricValues[i].MetricProperty.includes(`/${num}/`)
    ) {
      data.MemberID = metric;
      data.MetricValue = metricValues[i].MetricValue;
      data.TimeStamp = metricValues[i].TimeStamp;
      data.num = num;
    }
  }

  if (data.memberID == "" || isNaN(parseInt(data.MetricValue))) {
    console.log(data);
    throw "Could not get requested metric!";
  } else {
    return data;
  }
};

let mockupMetricReport = {
  "@Redfish.Copyright":
    "Copyright 2014-2016 Distributed Management Task Force, Inc. (DMTF). All rights reserved.",
  "@odata.context": "/redfish/v1/$metadata#MetricReport.MetricReport",
  "@odata.type": "#MetricReport.v1_0_0.MetricReport",
  "@odata.id": "/redfish/v1/TelemetryService/MetricReports/CPUMetrics",
  Id: "CPUMetrics",
  Name: "CPUMetrics",
  EventTimestamp: "2018-10-25 19:40:32.546420",
  MetricReportDefinition: {
    "@odata.id":
      "/redfish/v1/TelemetryService/MetricReportDefinitions/CPUMetrics"
  },
  MetricValues: [
    {
      MemberID: "CPUPeakUtil",
      MetricValue: "20",
      TimeStamp: "20181110T142504-0500",
      MetricProperty: "/redfish/v1/Chassis/Tray_1/CPU/CPUControl/1/CPUUtil"
    },
    {
      MemberID: "CPUPeakDuration",
      MetricValue: "5",
      TimeStamp: "20181110T142504-0500",
      MetricProperty: "/redfish/v1/Chassis/Tray_1/CPU/CPUControl/1/CPUUtil"
    },
    {
      MemberID: "CPUPeakStartTime",
      MetricValue: "1",
      TimeStamp: "20181110T142504-0500",
      MetricProperty: "/redfish/v1/Chassis/Tray_1/CPU/CPUControl/1/CPUUtil"
    },
    {
      MemberID: "CPUPercentUtil",
      MetricValue: "11",
      TimeStamp: "2018-11-18T22:22:52.865Z",
      MetricProperty: "/redfish/v1/Chassis/Tray_1/CPU/CPUControl/1/CPUUtil"
    },
    {
      MemberID: "CPUPercentUtil",
      MetricValue: "67",
      TimeStamp: "2018-11-18T22:22:53.832Z",
      MetricProperty: "/redfish/v1/Chassis/Tray_1/CPU/CPUControl/3/CPUUtil"
    },
    {
      MemberID: "CPUPercentUtil",
      MetricValue: "71",
      TimeStamp: "2018-11-18T22:22:53.861Z",
      MetricProperty: "/redfish/v1/Chassis/Tray_1/CPU/CPUControl/2/CPUUtil"
    }
  ]
};

module.exports = {
  getMetric,
  mockupMetricReport
};
