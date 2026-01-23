import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { executePy } from './ai/node_bridge.js'; // Reusing our bridge

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_HOST = 'http://localhost:11434';

app.use(express.json());

// --- API: Python Memory Core Bridge ---

app.post('/api/memory/commit', async (req, res) => {
    try {
        const { content, agent } = req.body;
        const result = await executePy('commit', content, agent || 'web-client');
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/memory/recall', async (req, res) => {
    try {
        const { query } = req.query;
        const result = await executePy('recall', query);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/memory/sync', async (req, res) => {
    try {
        const result = await executePy('sync');
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- API: Ollama Proxy ---

app.post('/api/generate', async (req, res) => {
    try {
        // Forwarding to local Ollama instance
        const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Ollama Error: ${err}`);
        }

        // Streaming support or full JSON? 
        // For simplicity in this router, we assume non-streaming or we pipe the response.
        // If the client expects a stream, we should pipe.
        if (req.body.stream) {
            response.body.pipe(res);
        } else {
            const data = await response.json();
            res.json(data);
        }
    } catch (e) {
        console.error("Ollama Proxy Error:", e);
        res.status(502).json({ error: "Local Neural Mesh Unreachable" });
    }
});

app.get('/api/tags', async (req, res) => {
    try {
        const response = await fetch(`${OLLAMA_HOST}/api/tags`);
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(502).json({ error: "Local Neural Mesh Unreachable" });
    }
});

// --- Static Frontend Serving ---

// In production (after 'vite build'), serve dist
// In dev, we might run this alongside Vite, but this server is designed to be the main entry point.
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[Akashic Server] Bridge Active on http://localhost:${PORT}`);
    console.log(`[System] Linked to Python Core & Ollama (${OLLAMA_HOST})`);
});
