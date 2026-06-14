import { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const ComponentNode = ({ data }: { data: any }) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #333',
      borderRadius: '5px',
      padding: '10px',
      minWidth: '100px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label}</div>
      <div style={{ fontSize: '10px', color: '#666' }}>{data.type}</div>
      {data.inputs && data.inputs.map((input: any, i: number) => (
        <Handle
          key={`in-${input.id}`}
          type="target"
          position={Position.Left}
          id={input.id || `in-${i}`}
          style={{ top: `${(i + 1) * 100 / (data.inputs.length + 1)}%` }}
        />
      ))}
      {data.outputs && data.outputs.map((output: any, i: number) => (
        <Handle
          key={`out-${output.id}`}
          type="source"
          position={Position.Right}
          id={output.id || `out-${i}`}
          style={{ top: `${(i + 1) * 100 / (data.outputs.length + 1)}%` }}
        />
      ))}
    </div>
  );
};

const nodeTypes = {
  grasshopperComponent: ComponentNode,
};

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        if (file.name.endsWith('.ghx')) {
            parseGHX(result);
        } else {
            alert('Currently only supporting .ghx XML files for component UI generation. For full binary support (.gh), we would need a server-side parser or WASM parser.');
        }
      }
    };
    reader.readAsText(file);
  };

  const parseGHX = (xmlString: string) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // Find all objects in definition
        const objects = xmlDoc.querySelectorAll('chunk[name="Definition"] > chunks > chunk[name="Object"], chunk[name="Object"]');

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Helper to get item under an object safely
        const getChildItemText = (parent: Element, name: string) => {
            const item = Array.from(parent.querySelectorAll(`items > item[name="${name}"]`))
                            .find(el => el.parentElement?.parentElement === parent);
            return item?.textContent;
        };

        const extractParams = (chunk: Element) => {
           const params: { id: string; name: string }[] = [];
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

        // Find edges (wires)
        // Usually Wires are stored in component inputs: source guids
        // Or in a separate Wire chunk.

        objects.forEach((obj, index) => {
            const name = getChildItemText(obj, "Name") || `Component ${index}`;
            const guid = getChildItemText(obj, "InstanceGuid") || uuidv4();

            // Wait, we might have wire objects?
            if (name === "Wire") {
                 const wireData = Array.from(obj.querySelectorAll('chunk[name="WireData"]')).find(el => el.parentElement?.parentElement === obj);
                 if (wireData) {
                      const source = getChildItemText(wireData, "Source");
                      const target = getChildItemText(wireData, "Target");
                      if (source && target) {
                          newEdges.push({
                              id: `e-${source}-${target}`,
                              source: source,
                              target: target,
                              animated: true,
                              style: { stroke: '#888' }
                          });
                      }
                 }
                 return;
            }

            let x = Math.random() * 500;
            let y = Math.random() * 500;

            // Try to find bounds in root items
            let boundsItem = Array.from(obj.querySelectorAll('items > item[name="Bounds"]')).find(el => el.parentElement?.parentElement === obj);

            // If not found, look into Attributes chunk
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

            // Gather inputs/outputs
            const inputs = extractParams(obj); // Normally we filter by input/output, but XML structure is complex. We'll just add fake ports for demonstration

            // Grasshopper structure is deep. Usually inputs have "Source" items pointing to upstream Guids.
            const sourceItems = obj.querySelectorAll('item[name="Source"]');
            sourceItems.forEach(src => {
                const targetId = getChildItemText(src.parentElement?.parentElement as Element, "InstanceGuid") || guid;
                if (src.textContent) {
                    newEdges.push({
                        id: `e-${src.textContent}-${targetId}`,
                        source: src.textContent, // from output of upstream
                        target: targetId, // to this input
                        animated: true,
                        style: { stroke: '#45b7d1', strokeWidth: 2 }
                    });
                }
            });

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

        // Refine edges: Sometimes source points to a component, sometimes to a parameter.
        // We'll rely on ReactFlow's loose connection if the exact port ID is missing.

        setNodes(newNodes);
        setEdges(newEdges);
    } catch (e) {
        console.error("Failed to parse GHX", e);
        alert("Failed to parse GHX file.");
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '20px', background: '#2c3e50', color: 'white' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Grasshopper Web Viewer</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <input
                type="file"
                accept=".ghx,.gh"
                onChange={handleFileUpload}
                style={{
                    padding: '10px',
                    background: '#34495e',
                    border: '1px solid #45b7d1',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer'
                }}
            />
            <div style={{ fontSize: '14px', color: '#bdc3c7' }}>
                <p style={{ margin: '0' }}>1. Upload .ghx file to generate component UI.</p>
                <p style={{ margin: '0' }}>2. Components, positions, and connections are extracted.</p>
                <p style={{ margin: '0' }}>3. Rhino Compute integration ready via @selvajs/compute.</p>
            </div>
        </div>
      </header>
      <div style={{ flex: 1, background: '#f5f6fa' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
          <MiniMap nodeStrokeColor={(n) => {
              if (n.type === 'grasshopperComponent') return '#34495e';
              return '#eee';
            }}
            nodeColor={(n) => {
              if (n.type === 'grasshopperComponent') return '#fff';
              return '#fff';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
