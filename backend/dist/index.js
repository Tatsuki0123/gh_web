"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Fake state for VM
let vmState = {
    isRunning: false,
    ip: null
};
// Fake package store
let installedPackages = [];
app.get('/api/vm/status', (req, res) => {
    res.json(vmState);
});
app.post('/api/vm/start', (req, res) => {
    vmState = {
        isRunning: true,
        ip: "10.0.0.50"
    };
    res.json(vmState);
});
app.post('/api/vm/stop', (req, res) => {
    vmState = {
        isRunning: false,
        ip: null
    };
    res.json(vmState);
});
// Packages
app.get('/api/packages', (req, res) => {
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
app.post('/api/packages/install', (req, res) => {
    const { packageId } = req.body;
    if (!installedPackages.includes(packageId)) {
        installedPackages.push(packageId);
    }
    res.json({ success: true, installedPackages });
});
app.post('/api/packages/uninstall', (req, res) => {
    const { packageId } = req.body;
    installedPackages = installedPackages.filter(id => id !== packageId);
    res.json({ success: true, installedPackages });
});
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
