import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Setup() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [vmStatus, setVmStatus] = useState('Idle');

  const handleLoginSuccess = (credentialResponse: any) => {
    console.log(credentialResponse);
    // User logged in, we could store credentials here
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center relative p-4">
      {/* Background with slight overlay */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-blue-900/40 z-0"></div>

      <div className="glass-panel max-w-2xl w-full p-8 z-10 flex flex-col gap-6 text-white shadow-2xl">
        <h1 className="text-3xl font-bold mb-4">Grasshopper Web Viewer Setup</h1>

        <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-semibold mb-4">1. Account</h2>
            <p className="text-sm text-gray-200 mb-4">Login with your Google account to save configurations and VM settings.</p>
            <div className="w-fit">
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => {
                    console.log('Login Failed');
                  }}
                />
            </div>
        </div>

        <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-semibold mb-4">2. Compute Environment</h2>

            <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium">Google Cloud API Key (Optional)</label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="p-3 bg-black/20 rounded-lg border border-white/10 focus:outline-none focus:border-white/50 transition-colors"
                />
            </div>

            <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg">
                <div>
                    <div className="font-semibold">Rhino Compute VM</div>
                    <div className="text-xs text-gray-300">Status: <span className={vmStatus === 'Active' ? 'text-green-400' : 'text-yellow-400'}>{vmStatus}</span></div>
                </div>
                <button
                    onClick={() => setVmStatus('Active')}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md font-medium transition-colors"
                >
                    Start VM
                </button>
            </div>
        </div>

        <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-semibold mb-4">3. Plugins</h2>
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <span>Weaverbird</span>
                    <button className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded">Install</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <span>Kangaroo 2</span>
                    <button className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded">Install</button>
                </div>
            </div>
        </div>

        <button
            onClick={() => navigate('/canvas')}
            className="mt-4 bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-transform transform hover:scale-[1.02]"
        >
            Enter Viewer
        </button>
      </div>
    </div>
  );
}
