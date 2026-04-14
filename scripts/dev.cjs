/* eslint-disable no-console */

const { execSync, spawn } = require('node:child_process');
const path = require('node:path');

const PORT_PRIMARY = 5173;
const PORT_FALLBACK = 5174;

function isWindows() {
  return process.platform === 'win32';
}

function getListeningPidsForPort(port) {
  if (!isWindows()) return [];

  const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
  const lines = output.split(/\r?\n/);

  const pids = new Set();
  const portToken = `:${port}`;

  for (const line of lines) {
    // Example (Windows):
    //   TCP    0.0.0.0:5173           0.0.0.0:0              LISTENING       50084
    //   TCP    [::]:5173              [::]:0                 LISTENING       50084
    if (!line.includes('LISTENING')) continue;
    if (!line.includes(portToken)) continue;

    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && /^\d+$/.test(pid)) pids.add(Number(pid));
  }

  return Array.from(pids);
}

function isNodePid(pid) {
  if (!isWindows()) return false;

  try {
    const output = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf8' }).trim();
    // CSV: "Image Name","PID",...
    return output.toLowerCase().includes('node.exe');
  } catch {
    return false;
  }
}

function killPid(pid) {
  if (!isWindows()) return;

  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
  } catch {
    // ignore
  }
}

function freePort(port) {
  const pids = getListeningPidsForPort(port);
  if (pids.length === 0) return;

  // Only kill Node processes to avoid nuking random apps.
  for (const pid of pids) {
    if (isNodePid(pid)) killPid(pid);
  }
}

function isPortFree(port) {
  return getListeningPidsForPort(port).length === 0;
}

function pickPort() {
  // Prefer 5173; if busy, try to free it.
  freePort(PORT_PRIMARY);
  if (isPortFree(PORT_PRIMARY)) return PORT_PRIMARY;

  // Fall back to 5174; if busy, try to free it.
  freePort(PORT_FALLBACK);
  if (isPortFree(PORT_FALLBACK)) return PORT_FALLBACK;

  throw new Error(`Both ports ${PORT_PRIMARY} and ${PORT_FALLBACK} are in use.`);
}

function run() {
  const port = pickPort();

  const viteCli = path.resolve(__dirname, '..', 'node_modules', 'vite', 'bin', 'vite.js');
  const args = [viteCli, '--host', '--port', String(port)];
  const child = spawn(process.execPath, args, { stdio: 'inherit' });

  child.on('exit', (code) => {
    process.exitCode = code ?? 0;
  });
}

run();
