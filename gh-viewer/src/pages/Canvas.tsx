import { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Play } from 'lucide-react';
import GeometryViewer from '../components/GeometryViewer';
import VMToggle from '../components/VMToggle';
import { fetchDefinition } from '../compute';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const ComponentNode = ({ data }: { data: any }) => {
  return (
    <div className="glass-panel p-3 min-w-[120px] text-center bg-white/60 text-gray-800 shadow-md">
      <div className="font-bold mb-1 text-sm">{data.label}</div>
      <div className="text-[10px] text-gray-500">{data.type}</div>
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

export default function Canvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showGeometry, setShowGeometry] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
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
            alert('Currently only supporting .ghx XML files for component UI generation.');
        }
      }
    };
    reader.readAsText(file);
  };

  const parseGHX = (xmlString: string) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const objects = xmlDoc.querySelectorAll('chunk[name="Object"]');

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        const getChildItemText = (parent: Element, name: string) => {
            const items = Array.from(parent.querySelectorAll(`item[name="${name}"]`));
            const direct = items.find(el => el.closest('chunk') === parent);
            return (direct || items[0])?.textContent;
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

        objects.forEach((obj, index) => {
            const name = getChildItemText(obj, "Name") || `Component ${index}`;
            const guid = getChildItemText(obj, "InstanceGuid") || uuidv4();

            if (name === "Wire") {
                 const wireData = Array.from(obj.querySelectorAll('chunk[name="WireData"]')).find(el => el.closest('chunk') === obj);
                 if (wireData) {
                      const source = getChildItemText(wireData, "Source");
                      const target = getChildItemText(wireData, "Target");
                      if (source && target) {
                          newEdges.push({
                              id: `e-${source}-${target}`,
                              source: source,
                              target: target,
                              animated: true,
                              style: { stroke: '#45b7d1', strokeWidth: 2 }
                          });
                      }
                 }
                 return;
            }

            let x = Math.random() * 500;
            let y = Math.random() * 500;

            let boundsItem = Array.from(obj.querySelectorAll('item[name="Bounds"]')).find(el => {
                const parentChunk = el.closest('chunk');
                return parentChunk === obj || parentChunk?.getAttribute('name') === 'Attributes';
            });

            if (boundsItem) {
              const xNode = boundsItem.querySelector('X');
              const yNode = boundsItem.querySelector('Y');
              if (xNode && xNode.textContent) x = parseFloat(xNode.textContent);
              if (yNode && yNode.textContent) y = parseFloat(yNode.textContent);
            }

            const inputs = extractParams(obj);

            const sourceItems = obj.querySelectorAll('item[name="Source"]');
            sourceItems.forEach(src => {
                const targetId = getChildItemText(src.parentElement?.parentElement as Element, "InstanceGuid") || guid;
                if (src.textContent) {
                    newEdges.push({
                        id: `e-${src.textContent}-${targetId}`,
                        source: src.textContent,
                        target: targetId,
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

        setNodes(newNodes);
        setEdges(newEdges);
    } catch (e) {
        console.error("Failed to parse GHX", e);
        alert("Failed to parse GHX file.");
    }
  };

  const [computeError, setComputeError] = useState<string | null>(null);

  const runCompute = async () => {
    if (!fileContent) {
        alert("Please upload a file first.");
        return;
    }

    // In a real application, we'd fetch the user's specific VM URL from the backend
    // Since the backend manages the mocked VM State, we will attempt to connect
    // to whatever URL is configured there (defaulting to localhost:8081).
    setComputeError(null);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'}/vm/status`);
        const status = await res.json();

        const computeUrl = status.computeUrl || 'http://localhost:8081/';
        console.log("Connecting to compute server:", computeUrl);

        // This will attempt a real connection to the compute server
        await fetchDefinition(fileContent, computeUrl);

        alert(`Successfully connected to Rhino Compute at ${computeUrl}`);
        setShowGeometry(true);
    } catch (e: any) {
        console.error("Compute error", e);
        setComputeError(`Failed to evaluate via Rhino Compute: ${e.message}. Ensure your Compute server is running and CORS is configured.`);
        // For demonstration, we still show geometry to let user play with UI
        setShowGeometry(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative text-gray-800">
      <header className="p-4 glass-panel m-4 flex justify-between items-center z-10 bg-white/80">
        <div>
          <h1 className="text-xl font-bold text-gray-800 m-0 mb-2">Canvas</h1>
          <div className="flex gap-4 items-center">
            <input
                type="file"
                accept=".ghx,.gh"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm text-gray-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <VMToggle />
          <div className="h-8 w-px bg-gray-300"></div>
          <button
            onClick={runCompute}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-colors cursor-pointer"
          >
            <Play size={18} />
            Run
          </button>
        </div>
      </header>

      {computeError && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl text-sm shadow-md" role="alert">
             <strong className="font-bold">Compute Error! </strong>
             <span className="block sm:inline">{computeError}</span>
             <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setComputeError(null)}>
                 <svg className="fill-current h-6 w-6 text-red-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
             </span>
          </div>
      )}

      <div className="absolute inset-0 bg-gray-50 -z-10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {showGeometry && <GeometryViewer onClose={() => setShowGeometry(false)} />}
    </div>
  );
}
