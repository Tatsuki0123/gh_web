const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM("");
const DOMParser = dom.window.DOMParser;
const parser = new DOMParser();

const xmlString = fs.readFileSync('test.ghx', 'utf8');

const xmlDoc = parser.parseFromString(xmlString, "text/xml");

const objects = xmlDoc.querySelectorAll('chunk[name="Definition"] > chunks > chunk[name="Object"], chunk[name="Object"]');
console.log("Found objects:", objects.length);

const getChildItemText = (parent, name) => {
    const item = Array.from(parent.querySelectorAll(`items > item[name="${name}"]`))
                    .find(el => el.parentElement?.parentElement === parent);
    return item?.textContent;
};

objects.forEach((obj, index) => {
    const name = getChildItemText(obj, "Name") || `Component ${index}`;
    console.log("Component:", name);
});
