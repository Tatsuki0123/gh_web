import { useState, useEffect } from 'react';
import { Power, Box, Download, Trash2 } from 'lucide-react';

// Use environment variable for API_BASE if available, otherwise fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export default function VMToggle() {
  const [isRunning, setIsRunning] = useState(false);
  const [_ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPackages, setShowPackages] = useState(false);
  const [packages, setPackages] = useState<{ available: any[], installed: string[] }>({ available: [], installed: [] });

  useEffect(() => {
    fetchStatus();
    fetchPackages();
  }, []);

  const fetchStatus = async () => {
    try {
        const res = await fetch(`${API_BASE}/vm/status`);
        const data = await res.json();
        setIsRunning(data.isRunning);
        setIp(data.ip);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
        const res = await fetch(`${API_BASE}/packages`);
        const data = await res.json();
        setPackages(data);
    } catch (e) {
        console.error(e);
    }
  };

  const toggleVM = async () => {
      setLoading(true);
      try {
          const endpoint = isRunning ? '/vm/stop' : '/vm/start';
          const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST' });
          const data = await res.json();
          setIsRunning(data.isRunning);
          setIp(data.ip);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const installPackage = async (id: string) => {
    try {
        await fetch(`${API_BASE}/packages/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageId: id })
        });
        fetchPackages();
    } catch(e) { console.error(e); }
  };

  const uninstallPackage = async (id: string) => {
    try {
        await fetch(`${API_BASE}/packages/uninstall`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageId: id })
        });
        fetchPackages();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="flex gap-2 items-center relative">
       {isRunning && (
           <button
             onClick={() => setShowPackages(!showPackages)}
             className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-colors flex items-center justify-center relative"
             title="Package Manager"
           >
               <Box size={20} />
               {packages.installed.length > 0 && (
                   <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                       {packages.installed.length}
                   </span>
               )}
           </button>
       )}

       <button
           onClick={toggleVM}
           disabled={loading}
           className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-md transition-colors ${
               isRunning ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
           } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
       >
           <Power size={18} className={isRunning ? 'text-green-600' : 'text-gray-500'} />
           {loading ? 'Wait...' : isRunning ? 'VM Running' : 'VM Off'}
       </button>

       {showPackages && isRunning && (
           <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden text-left">
               <div className="p-3 bg-blue-50 border-b border-blue-100 font-bold text-blue-900 flex items-center gap-2">
                   <Box size={18} />
                   Package Manager
               </div>
               <div className="max-h-64 overflow-y-auto">
                   {packages.available.map(pkg => {
                       const isInstalled = packages.installed.includes(pkg.id);
                       return (
                           <div key={pkg.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center gap-3">
                               <div>
                                   <div className="font-semibold text-sm">{pkg.name} <span className="text-xs font-normal text-gray-500">v{pkg.version}</span></div>
                                   <div className="text-xs text-gray-500 line-clamp-1">{pkg.description}</div>
                               </div>
                               <div>
                                   {isInstalled ? (
                                       <button onClick={() => uninstallPackage(pkg.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md" title="Uninstall">
                                           <Trash2 size={16} />
                                       </button>
                                   ) : (
                                       <button onClick={() => installPackage(pkg.id)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md" title="Install">
                                           <Download size={16} />
                                       </button>
                                   )}
                               </div>
                           </div>
                       )
                   })}
               </div>
           </div>
       )}
    </div>
  );
}
