const fs = require('fs');

// We need a real valid ghx to test against if possible.
// A user issue was that the canvas components aren't showing up.
// Let's create a minimal test string of a ghx without the chunks inside the Object.
// It seems the problem might be in how `chunks` are nested or `Objects` are targeted.

const xmlString = `<?xml version="1.0" encoding="utf-8"?>
<GHX>
  <chunks>
    <chunk name="Document">
      <chunks>
        <chunk name="Definition">
          <chunks>
            <chunk name="Object" index="0">
              <items>
                <item name="Name" type_name="gh_string" type_code="10">My Component</item>
                <item name="InstanceGuid" type_name="gh_guid" type_code="9">abc-123</item>
              </items>
              <chunks>
                <chunk name="Attributes">
                  <items>
                    <item name="Bounds" type_name="gh_drawing_rectangleF" type_code="35">
                      <X>150</X>
                      <Y>200</Y>
                    </item>
                  </items>
                </chunk>
              </chunks>
            </chunk>
          </chunks>
        </chunk>
      </chunks>
    </chunk>
  </chunks>
</GHX>`;

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM("");
const DOMParser = dom.window.DOMParser;
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlString, "text/xml");

// The code uses:
// xmlDoc.querySelectorAll('chunk[name="Definition"] > chunks > chunk[name="Object"], chunk[name="Object"]');

const objects = xmlDoc.querySelectorAll('chunk[name="Definition"] > chunks > chunk[name="Object"], chunk[name="Object"]');
console.log("Found:", objects.length);
