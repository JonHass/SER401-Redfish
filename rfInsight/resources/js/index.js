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

var count = 0;
var displayed = [];

$("#add").click(function(e) {
  e.preventDefault();
  $("ul.dropdown").slideToggle("medium");
});

$(".dropdown li").on("click", function() {
  $("ul.dropdown").slideToggle("medium");
  updatePanel(this);
});

let isThemeDark = true;
let themeURLParam = "";

setThemeString = () => {
  themeURLParam = isThemeDark ? "&theme=dark" : "&theme=light";
};

function updateTheme(isDark) {
  isThemeDark = isDark;
  if (isDark == false) {
    document.body.classList.add("themeLight");
  } else {
    document.body.classList = [];
  }
  setThemeString();
  updatePanels();
}

let updatePanel = panelElement => {
  var value;
  if (panelElement.type === "") {
    value = $(panelElement).index();
  } else {
    value = parseInt(panelElement, 10);
  }
  var url = "";
  var label = "";

  var panel1URL =
    "http://52.37.217.87:3000/d-solo/uiNmWixmz/randomdata?refresh=5s&orgId=1&panelId=2&var-Host=serverB" +
    themeURLParam;
  var panel2URL =
    "http://52.37.217.87:3000/d-solo/uiNmWixmz/randomdata?refresh=5s&orgId=1&panelId=2&var-Host=serverA" +
    themeURLParam;
  var panel3URL =
    "http://52.37.217.87:3000/d-solo/uiNmWixmz/randomdata?refresh=5s&orgId=1&var-Host=serverA&panelId=6" +
    themeURLParam;
  var panel4URL =
    "http://52.37.217.87:3000/d-solo/uiNmWixmz/randomdata?refresh=5s&orgId=1&panelId=4&var-Host=serverB" +
    themeURLParam;
  var panel5URL =
    "http://52.37.217.87:3000/d-solo/uwmb0iBmz/testdash?refresh=5s&panelId=4&fullscreen&orgId=1" +
    themeURLParam;

  var panel1Label = "Thermal Status";
  var panel2Label = "Fan Status";
  var panel3Label = "Fan Inventory";
  var panel4Label = "PSU Inventory";
  var panel5Label = "PSU Primary Status";

  switch (value) {
    case 0:
      url = panel1URL;
      label = panel1Label;
      break;

    case 1:
      url = panel2URL;
      label = panel2Label;
      break;

    case 2:
      url = panel3URL;
      label = panel3Label;
      break;

    case 3:
      url = panel4URL;
      label = panel4Label;
      break;

    case 4:
      url = panel5URL;
      label = panel5Label;
      break;

    case 5:
      let urls = [panel1URL, panel2URL, panel3URL, panel4URL, panel5URL];

      let labels = [
        panel1Label,
        panel2Label,
        panel3Label,
        panel4Label,
        panel5Label
      ];

      // let html = "<table class=\"panelTable\">";
      let html = "";

      for (var index in urls) {
        html += '<td class="panelCell">';
        html +=
          "<div id='panel_area_" +
          index +
          "'><iframe src=\"" +
          urls[index] +
          '" class="panelFrame" frameborder="0"></iframe>';
        html += '<div class="labelContainer text">';
        html += "<span>";
        html +=
          "<i class='fa fa-trash del' aria-hidden='true' id='" +
          index +
          "'></i>";
        html += "<h2>" + labels[index] + "</h2>";
        html += "</span>";
        html += "</div>";
        html += "</td>";
      }

      // html += "</table>";

      $(".main_container").empty();
      $(".main_container").html(html);
      return;
  }

  if ($.inArray(value, displayed) !== -1) {
    alert("Panel already added!!");
  } else {
    displayed.push(value);
    let html =
      '<td class="panelCell"><div id=\'panel_area_' +
      value +
      "'><iframe src='" +
      url +
      "' class='panelFrame' frameborder='0'></iframe>";
    html +=
      "<br /><i class='fa fa-trash del' aria-hidden='true' id='" +
      value +
      "'></i><h2 class='text'>" +
      label +
      "</h2></div>";
    $(".main_container").append(html);
  }
};

$("body").on("click", ".del", function() {
  var index = displayed.indexOf(this.id);
  displayed.splice(index, 1);
  $("#panel_area_" + this.id).remove();
});

let updatePanels = () => {
  for (var id in displayed) {
    displayed = [];
    $("#panel_area_" + id).remove();
    console.log(id);
    updatePanel(id);
  }
};
