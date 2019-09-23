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

const rTools = require("../resources/js/redfishTools");

const mockup = rTools.mockupMetricReport;

test("Returns filled object", () => {
  expect(rTools.getMetric(mockup.MetricValues, "CPUPeakUtil", 1, 1)).toEqual({
    MemberID: "CPUPeakUtil",
    MetricValue: "20",
    TimeStamp: "20181110T142504-0500",
    num: 1
  });
});

test("Returns filled object", () => {
  expect(rTools.getMetric(mockup.MetricValues, "CPUPercentUtil", 1, 3)).toEqual(
    {
      MemberID: "CPUPercentUtil",
      MetricValue: "67",
      TimeStamp: "2018-11-18T22:22:53.832Z",
      num: 3
    }
  );
});

test("Throws could not get requested metric!", () => {
  expect(() => {
    rTools.getMetric(mockup.MetricValues, "CPU", 1, 0);
  }).toThrow("Could not get requested metric!");
});

test("Throws could not get requested metric!", () => {
  expect(() => {
    rTools.getMetric(mockup.MetricValues, "CPUPercentUtil", 1, 4);
  }).toThrow("Could not get requested metric!");
});
