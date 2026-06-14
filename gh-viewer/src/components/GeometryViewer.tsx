import { Rnd } from 'react-rnd';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { X, Maximize2 } from 'lucide-react';
import { useState } from 'react';

export default function GeometryViewer({ onClose }: { onClose: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Rnd
      default={{
        x: window.innerWidth - 450,
        y: window.innerHeight - 450,
        width: 400,
        height: 400,
      }}
      minWidth={300}
      minHeight={300}
      bounds="parent"
      className="glass-panel overflow-hidden flex flex-col shadow-2xl z-50 bg-white/10"
      disableDragging={isExpanded}
      size={isExpanded ? { width: window.innerWidth - 40, height: window.innerHeight - 40 } : undefined}
      position={isExpanded ? { x: 20, y: 20 } : undefined}
    >
      <div className="bg-gray-800/80 p-2 flex justify-between items-center cursor-move text-white" id="drag-handle">
        <span className="font-semibold text-sm">3D Geometry Viewer</span>
        <div className="flex gap-2">
            <button onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer">
              <Maximize2 size={16} />
            </button>
            <button onClick={onClose} className="hover:bg-red-500 p-1 rounded transition-colors cursor-pointer">
              <X size={16} />
            </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full bg-gray-900/50 relative">
          <Canvas camera={{ position: [5, 5, 5] }}>
            <color attach="background" args={['#1a1a2e']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />

            {/* A sample geometry to show */}
            <mesh>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="#45b7d1" wireframe={true} />
            </mesh>

            <Grid infiniteGrid fadeDistance={20} sectionColor="#444" cellColor="#222" />
            <OrbitControls makeDefault />
          </Canvas>
          <div className="absolute bottom-2 right-2 text-xs text-white/50 bg-black/40 px-2 py-1 rounded pointer-events-none">
            Left Click: Rotate | Right Click: Pan | Scroll: Zoom
          </div>
      </div>
    </Rnd>
  );
}
