const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM("");
const DOMParser = dom.window.DOMParser;
const parser = new DOMParser();

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

const xmlDoc = parser.parseFromString(xmlString, "text/xml");

// Robust get text helper
const getText = (parent, selector) => {
    const el = parent.querySelector(selector);
    return el ? el.textContent : null;
};

const objects = xmlDoc.querySelectorAll('chunk[name="Object"]');
objects.forEach(obj => {
    const name = getText(obj, 'item[name="Name"], item[name="Nickname"]');
    const guid = getText(obj, 'item[name="InstanceGuid"]');

    let x = 0, y = 0;
    const bounds = obj.querySelector('item[name="Bounds"]');
    if (bounds) {
        x = parseFloat(getText(bounds, 'X') || '0');
        y = parseFloat(getText(bounds, 'Y') || '0');
    }

    console.log(`Obj: ${name} (${guid}) @ ${x},${y}`);
});
