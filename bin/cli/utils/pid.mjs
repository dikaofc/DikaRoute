import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { resolveDataDir } from "../data-dir.mjs";

// #9455: "supervisor" must be tracked so killAllSubprocesses() can stop the
// supervisor process, not just the child server it spawned (and respawns).
const SERVICES = ["server", "supervisor", "mitm", "tunnel/cloudflared", "tunnel/tailscale"];

function getServicePidPath(service) {
  return join(resolveDataDir(), service, ".pid");
}

export function writePidFile(service, pid) {
  try {
    const dir = join(resolveDataDir(), service);
    mkdirSync(dir, { recursive: true });
    writeFileSync(getServicePidPath(service), String(pid), "utf8");
    return true;
  } catch {
    return false;
  }
}

export function readPidFile(service) {
  try {
    const file = getServicePidPath(service);
    if (!existsSync(file)) return null;
    const pid = parseInt(readFileSync(file, "utf8").trim(), 10);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

export function cleanupPidFile(service) {
  try {
    unlinkSync(getServicePidPath(service));
  } catch {}
}

export function killAllSubprocesses() {
  for (const service of SERVICES) {
    const pid = readPidFile(service);
    if (!pid) continue;
    try {
      process.kill(pid, "SIGTERM");
    } catch {}
    cleanupPidFile(service);
  }
}

export function isPidRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// #2460: Default raised from 15s to 60s so Windows users (slower Next.js
// cold start due to filesystem watchers, antivirus, etc.) get a working
// "server ready" signal instead of a phantom timeout while the server is
// still booting. TCP fallback marks the server as ready when the port
// has been listening for >= 3s consecutively AND the health route is
// actively rejecting/resetting connections fast (route not mounted yet,
// but the HTTP server is clearly alive and responsive) — never for a
// socket that merely accepts TCP and then hangs without ever completing
// a single request (#6800: that's a still-booting/CPU-bound process, not
// a "route not mounted" gap, and must NOT be reported as ready).
//
// A 503 from the health route (status:"degraded", e.g. the DB driver is
// unavailable — sql.js WASM missing on Termux, better-sqlite3 ABI mismatch)
// is ALSO never reported ready: the HTTP server is up and answering, but the
// app is not functional. Classified as "degraded" and excluded from the
// fast-reject grace window so the CLI does not print the success banner for
// a boot that will 500 on every request.
export async function waitForServer(port, timeout = 60000) {
  const start = Date.now();
  let tcpListeningSince = null;
  while (Date.now() - start < timeout) {
    const outcome = await pollHealthOnce(port);
    if (outcome === "ready") return true;
    if (outcome === "fast-reject") {
      if (tcpListeningSince === null) tcpListeningSince = Date.now();
      if (Date.now() - tcpListeningSince >= 3000) return true;
    } else {
      // "hanging" (request timed out with no response at all),
      // "not-listening", or "degraded" (HTTP 503: server up but app
      // unhealthy — e.g. DB driver failed) — none count toward the grace
      // window, and degraded never becomes ready.
      tcpListeningSince = null;
    }
    await sleep(500);
  }
  return false;
}

// Polls /api/monitoring/health once and classifies the outcome:
// - "ready": got a 2xx HTTP response.
// - "degraded": got HTTP 503 with status:"degraded" — the server is alive
//   and answering, but the app is unhealthy (e.g. DB driver unavailable).
//   Never reported ready.
// - "fast-reject": got any other non-2xx HTTP response, or the connection
//   was actively refused/reset (not a timeout) — the HTTP server is alive
//   and answering quickly, just not routing this endpoint yet (#2460).
// - "hanging": the request timed out waiting for any response — the
//   process accepted the TCP connection but never answered (#6800).
// - "not-listening": nothing is accepting connections on the port at all.
async function pollHealthOnce(port) {
  try {
    const res = await fetch(`http://localhost:${port}/api/monitoring/health`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return "ready";
    if (res.status === 503) {
      try {
        const body = await res.json();
        if (body?.status === "degraded") return "degraded";
      } catch {
        // body not JSON — treat as a plain fast-reject below
      }
    }
    return "fast-reject";
  } catch (err) {
    if (err?.name === "TimeoutError") return "hanging";
    const listening = await isPortListening(port).catch(() => false);
    return listening ? "fast-reject" : "not-listening";
  }
}

async function isPortListening(port) {
  const net = await import("node:net");
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port, timeout: 1000 });
    const finish = (ok) => {
      try {
        socket.destroy();
      } catch {}
      resolve(ok);
    };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

