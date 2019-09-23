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

let convertToIsoDate = simDate => {
  // Example input: "20161108T142504-0500"
  // Desired output: 2016-11-08T14:25:04-0500

  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-\d{4}/.test(simDate)) {
    return simDate;
  } else if (/\d{8}T\d{6}-\d{4}/.test(simDate)) {
    const dateCharacters = simDate.split("");
    let isoDate = "";
    for (var i = 0; i < dateCharacters.length; i++) {
      if (i === 4 || i === 6) {
        isoDate += "-";
      }
      if (i === 11 || i === 13) {
        isoDate += ":";
      }
      isoDate += dateCharacters[i];
    }
    return isoDate;
  } else if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(simDate)) {
    return simDate;
  } else {
    throw "Invalid timestamp format!";
  }
};

module.exports = {
  convertToIsoDate
};
