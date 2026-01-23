import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_SCRIPT = path.join(__dirname, 'memory_core.py');

export async function executePy(command, ...args) {
    return new Promise((resolve, reject) => {
        const py = spawn('python3', [PYTHON_SCRIPT, command, ...args]);
        
        let output = '';
        let error = '';

        py.stdout.on('data', (data) => {
            output += data.toString();
        });

        py.stderr.on('data', (data) => {
            error += data.toString();
        });

        py.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${error}`));
            } else {
                try {
                    resolve(JSON.parse(output.trim()));
                } catch (e) {
                    resolve({ raw: output.trim() });
                }
            }
        });
    });
}

// CLI capabilities
if (process.argv[1] === __filename) {
    const cmd = process.argv[2];
    const args = process.argv.slice(3);
    
    if (cmd) {
        executePy(cmd, ...args)
            .then(res => console.log(JSON.stringify(res, null, 2)))
            .catch(err => console.error(err));
    } else {
        console.log("Usage: node node_bridge.js <command> [args...]");
    }
}
