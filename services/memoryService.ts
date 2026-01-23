import { MemoryEntry, MindMapData, MindMapNode, MindMapLink } from '../types';

const STORAGE_KEY = 'AKASHIC_MEMORY_DB_V1';

class MemoryService {
  private memoryCache: Map<string, MemoryEntry>;

  constructor() {
    this.memoryCache = new Map();
    this.loadFromDisk();
  }

  // --- Genesis Hashing (SHA-256) ---
  async generateGenesisHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // --- Persistence ---
  private loadFromDisk() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Rehydrate Map
        Object.values(parsed).forEach((entry: any) => {
          this.memoryCache.set(entry.id, entry);
        });
      }
    } catch (e) {
      console.warn("Akashic records corrupted or empty.", e);
    }
  }

  private saveToDisk() {
    const obj = Object.fromEntries(this.memoryCache);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  // --- Core Operations ---
  async commitMemory(content: string, type: MemoryEntry['type'], meta: any = {}): Promise<MemoryEntry> {
    const id = await this.generateGenesisHash(content + type + Date.now()); // Ensure uniqueness with timestamp
    
    // Auto-link to similar concepts (simulated)
    const connections = this.findCorrelates(content).slice(0, 3).map(m => m.id);

    const entry: MemoryEntry = {
      id,
      content,
      type,
      connections,
      timestamp: Date.now(),
      meta
    };

    this.memoryCache.set(id, entry);
    this.saveToDisk();
    return entry;
  }

  findCorrelates(query: string): MemoryEntry[] {
    // Simple text-based "fractal correlate" search
    const results: MemoryEntry[] = [];
    const queryTokens = query.toLowerCase().split(' ').filter(t => t.length > 3);

    for (const entry of this.memoryCache.values()) {
      let score = 0;
      const entryText = entry.content.toLowerCase();
      queryTokens.forEach(token => {
        if (entryText.includes(token)) score++;
      });
      if (score > 0) results.push(entry);
    }

    return results.sort((a, b) => b.timestamp - a.timestamp); // Recent first
  }

  getAllMemories(): MemoryEntry[] {
    return Array.from(this.memoryCache.values());
  }

  // --- Mindmap Projection ---
  getMindMapProjection(): MindMapData {
    const nodes: MindMapNode[] = [];
    const links: MindMapLink[] = [];
    const memories = this.getAllMemories();

    // Limit to recent 50 for performance
    const recent = memories.slice(-50);

    recent.forEach(mem => {
      nodes.push({
        id: mem.id,
        label: mem.content.substring(0, 20) + (mem.content.length > 20 ? '...' : ''),
        type: mem.type === 'insight' ? 'insight' : 'thought',
        value: 10,
        color: mem.type === 'insight' ? '#00ff80' : '#00f2ff'
      });

      mem.connections.forEach(targetId => {
        if (recent.find(r => r.id === targetId)) {
          links.push({
            source: mem.id,
            target: targetId,
            strength: 1
          });
        }
      });
    });

    return { nodes, links };
  }
}

export const memoryService = new MemoryService();
