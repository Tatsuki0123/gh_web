import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Fake state for VM
let vmState = {
    isRunning: false,
    ip: null as string | null
};

// Fake package store
let installedPackages: any[] = [];

app.get('/api/vm/status', (req: Request, res: Response) => {
    res.json(vmState);
});

app.post('/api/vm/start', (req: Request, res: Response) => {
    vmState = {
        isRunning: true,
        ip: "10.0.0.50"
    };
    res.json(vmState);
});

app.post('/api/vm/stop', (req: Request, res: Response) => {
    vmState = {
        isRunning: false,
        ip: null
    };
    res.json(vmState);
});

// Packages
app.get('/api/packages', (req: Request, res: Response) => {
    // Return mock available packages vs installed
    res.json({
        available: [
            { id: "lunchbox", name: "LunchBox", version: "2023.1", description: "LunchBox is a suite of tools for generating paneling and structure" },
            { id: "weaverbird", name: "Weaverbird", version: "0.9", description: "Topological Mesh Editor" },
            { id: "kangaroo", name: "Kangaroo", version: "2.5", description: "Live physics engine for interactive simulation" }
        ],
        installed: installedPackages
    });
});

app.post('/api/packages/install', (req: Request, res: Response) => {
    const { packageId } = req.body;
    if (!installedPackages.includes(packageId)) {
        installedPackages.push(packageId);
    }
    res.json({ success: true, installedPackages });
});

app.post('/api/packages/uninstall', (req: Request, res: Response) => {
    const { packageId } = req.body;
    installedPackages = installedPackages.filter(id => id !== packageId);
    res.json({ success: true, installedPackages });
});

app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
