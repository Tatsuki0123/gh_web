const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM("");
const DOMParser = dom.window.DOMParser;
const parser = new DOMParser();

const xmlString = fs.readFileSync('test.ghx', 'utf8');

const xmlDoc = parser.parseFromString(xmlString, "text/xml");

const objects = xmlDoc.querySelectorAll('chunk[name="Definition"] > chunks > chunk[name="Object"], chunk[name="Object"]');

const newNodes = [];
const newEdges = [];

const getChildItemText = (parent, name) => {
    const item = Array.from(parent.querySelectorAll(`items > item[name="${name}"]`))
                    .find(el => el.parentElement?.parentElement === parent);
    return item?.textContent;
};

const extractParams = (chunk) => {
   const params = [];
   const paramChunks = chunk.querySelectorAll('chunk[name="param_input"], chunk[name="param_output"], chunk[name="InputParam"], chunk[name="OutputParam"]');
   paramChunks.forEach(p => {
       const paramId = getChildItemText(p, "InstanceGuid");
       const paramName = getChildItemText(p, "Name") || getChildItemText(p, "Description");
       if (paramId) {
           params.push({ id: paramId, name: paramName || "Param" });
       }
   });
   return params;
};

objects.forEach((obj, index) => {
    const name = getChildItemText(obj, "Name") || `Component ${index}`;
    const guid = getChildItemText(obj, "InstanceGuid") || `uuid-${index}`;

    if (name === "Wire") {
         return;
    }

    let x = 0;
    let y = 0;

    let boundsItem = Array.from(obj.querySelectorAll('items > item[name="Bounds"]')).find(el => el.parentElement?.parentElement === obj);
    if (!boundsItem) {
        const attrs = Array.from(obj.querySelectorAll('chunk[name="Attributes"]')).find(el => el.parentElement?.parentElement === obj);
        if (attrs) {
            boundsItem = Array.from(attrs.querySelectorAll('items > item[name="Bounds"]')).find(el => el.parentElement?.parentElement === attrs);
        }
    }

    if (boundsItem) {
      const xNode = boundsItem.querySelector('X');
      const yNode = boundsItem.querySelector('Y');
      if (xNode && xNode.textContent) x = parseFloat(xNode.textContent);
      if (yNode && yNode.textContent) y = parseFloat(yNode.textContent);
    }

    const inputs = extractParams(obj);

    newNodes.push({
        id: guid,
        type: 'grasshopperComponent',
        position: { x, y },
        data: {
            label: name,
            type: 'Component',
            inputs: inputs.length > 0 ? inputs : [{ id: `in-${guid}`, name: "In" }],
            outputs: [{ id: guid, name: "Out" }]
        }
    });
});

console.log(JSON.stringify(newNodes, null, 2));
