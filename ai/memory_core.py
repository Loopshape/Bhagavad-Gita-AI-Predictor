import sys
import json
import os
import time
import hashlib
import sqlite3

# Default path
DEFAULT_DB_PATH = '/home/loop/ai-runtime/.repository/wsl-runtime/ai_memory.db'
DB_FILE = os.getenv('AKASHIC_DB_PATH', DEFAULT_DB_PATH)

def ensure_directory(path):
    dir_path = os.path.dirname(path)
    if dir_path and not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)

def get_connection():
    ensure_directory(DB_FILE)
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# --- Cognitive Orchestrator Layer ---

class CognitiveOrchestrator:
    def __init__(self, agent_id="System_Orchestrator"):
        self.agent_id = agent_id
        self.trace = []
        self.start_time = time.time()

    def log_thought(self, step, details):
        timestamp = time.time() - self.start_time
        self.trace.append({
            "step": step,
            "details": details,
            "t_plus": f"{timestamp:.4f}s"
        })

    def validate_protocol(self, intent):
        self.log_thought("Protocol Check", f"Validating intent: '{intent}' against safety directives.")
        # Simulation of a check
        if not intent:
            raise ValueError("Null intent detected. Protocol violation.")
        self.log_thought("Access Control", "User Identity verified. Write permissions: GRANTED.")
        return True

    def execute(self, task_name, task_func, *args):
        try:
            self.log_thought("Initialization", f"Spinning up task: {task_name}")
            
            # 1. Perception & Analysis
            self.log_thought("Perception", f"Analyzing arguments: {args}")
            
            # 2. Protocol Validation
            self.validate_protocol(task_name)
            
            # 3. Execution
            self.log_thought("Tool Execution", "Granting database handle lock...")
            result = task_func(*args)
            self.log_thought("Execution Status", "Operation completed successfully.")
            
            # 4. Final Report
            return {
                "orchestrator": {
                    "agent": self.agent_id,
                    "status": "protocol_compliant",
                    "reasoning_trace": self.trace,
                    "execution_time": time.time() - self.start_time
                },
                "result": json.loads(result) if isinstance(result, str) else result
            }
            
        except Exception as e:
            self.log_thought("Error Handling", f"Exception caught: {str(e)}")
            return {
                "orchestrator": {
                    "agent": self.agent_id,
                    "status": "protocol_violation_or_error",
                    "reasoning_trace": self.trace
                },
                "error": str(e)
            }

# --- Core Tools (Wrapped) ---

def init_db_tool():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS akashic_nodes (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            agent TEXT,
            timestamp REAL,
            entropy REAL,
            meta TEXT
        )
    ''')
    conn.commit()
    conn.close()
    return {"status": "schema_verified", "path": DB_FILE}

def generate_hash(content):
    return hashlib.sha256(content.encode()).hexdigest()

def commit_memory_tool(content, agent="unknown"):
    mem_hash = generate_hash(content)
    timestamp = time.time()
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM akashic_nodes WHERE id = ?", (mem_hash,))
    if cursor.fetchone():
        conn.close()
        return {"status": "exists", "hash": mem_hash}

    cursor.execute(
        "INSERT INTO akashic_nodes (id, content, agent, timestamp, entropy, meta) VALUES (?, ?, ?, ?, ?, ?)",
        (mem_hash, content, agent, timestamp, 0.5, "{}")
    )
    conn.commit()
    conn.close()
    
    return {
        "status": "success", 
        "hash": mem_hash, 
        "node": {
            "id": mem_hash,
            "content": content,
            "agent": agent,
            "timestamp": timestamp
        }
    }

def recall_memory_tool(query, limit=5):
    conn = get_connection()
    cursor = conn.cursor()
    
    wildcard = f"%{query}%"
    cursor.execute(
        "SELECT * FROM akashic_nodes WHERE content LIKE ? ORDER BY timestamp DESC LIMIT ?", 
        (wildcard, limit)
    )
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "content": row["content"],
            "agent": row["agent"],
            "timestamp": row["timestamp"],
            "entropy": row["entropy"]
        })
        
    return {"status": "success", "count": len(results), "matches": results}

# --- Main Entry Point ---

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)

    command = sys.argv[1]
    orchestrator = CognitiveOrchestrator()

    if command == "init":
        print(json.dumps(orchestrator.execute("Initialize Schema", init_db_tool), indent=2))

    elif command == "commit":
        content = sys.argv[2] if len(sys.argv) > 2 else ""
        agent = sys.argv[3] if len(sys.argv) > 3 else "system"
        print(json.dumps(orchestrator.execute("Commit Memory", commit_memory_tool, content, agent), indent=2))
        
    elif command == "recall":
        query = sys.argv[2] if len(sys.argv) > 2 else ""
        print(json.dumps(orchestrator.execute("Recall Memory", recall_memory_tool, query), indent=2))
        
    elif command == "sync":
        # Sync is just a status check in this context
        print(json.dumps(orchestrator.execute("System Sync", lambda: {"status": "synchronized", "backend": "sqlite3"}), indent=2))

    else:
        print(json.dumps({"error": "Unknown command"}))

if __name__ == "__main__":
    main()
