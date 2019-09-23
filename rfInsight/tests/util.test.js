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

const util = require("../resources/js/util");

// Valid input, needs conversion
test("Converts 20161108T142504-0500 to 2016-11-08T14:25:04-0500", () => {
  expect(util.convertToIsoDate("20161108T142504-0500")).toBe(
    "2016-11-08T14:25:04-0500"
  );
});

// Valid input, no conversion
test("Returns 2016-11-08T14:25:04-0500", () => {
  expect(util.convertToIsoDate("2016-11-08T14:25:04-0500")).toBe(
    "2016-11-08T14:25:04-0500"
  );
});

// Valid input, no conversion
test("Returns 2016-11-08T14:25:04.437Z", () => {
  expect(util.convertToIsoDate("2016-11-08T14:25:04.437Z")).toBe(
    "2016-11-08T14:25:04.437Z"
  );
});

// Invalid input
test("Throws Invalid timestamp format!", () => {
  expect(() => {
    util.convertToIsoDate("201611408T14:25:04-0500");
  }).toThrow("Invalid timestamp format!");
});
