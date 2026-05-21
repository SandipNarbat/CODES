const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const cors = require("cors");
const EventEmitter = require("events");
const backendEmitter = new EventEmitter();

const app = express();
const PORT = 8000;

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

// --------------------------------------------------
// Diff Engine
// --------------------------------------------------

function diffStates(oldState, newState) {
  const deltas = [];

  for (const key in newState) {
    const newMetrics = newState[key];
    const oldMetrics = oldState[key];

    if (!oldMetrics) {
      deltas.push({ key, type: "new", metrics: newMetrics });
      continue;
    }

    const changes = [];

    if (Array.isArray(newMetrics)) {
      newMetrics.forEach((n, i) => {
        if (oldMetrics[i] !== n) {
          changes.push({ index: i, old: oldMetrics[i], new: n });
        }
      });
    } else {
      if (JSON.stringify(oldMetrics) !== JSON.stringify(newMetrics)) {
        changes.push({ old: oldMetrics, new: newMetrics });
      }
    }

    if (changes.length > 0) {
      deltas.push({ key, type: "update", changes });
    }
  }

  return deltas;
}

// --------------------------------------------------
// Readers
// --------------------------------------------------

async function readJobsState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(",");
    state[parts[0]] = parts.slice(1);
  });

  return state;
}

async function readQueueState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.includes("VV3Q")) return;

    line = line.replace("NQKE", "-1");

    const parts = line.split(",");
    const key = parts[0];

    const metrics = parts.slice(1).map(v => {
      const num = parseInt(v.trim(), 10);
      return isNaN(num) ? 0 : num;
    });

    state[key] = metrics;
  });

  return state;
}
async function readPaymentsState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const [id, amount, status] = line.split(",");

    state[id] = {
      amount: Number(amount),
      status: status?.trim()
    };
  });

  return state;
}

async function readContextState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(/\s+/);
    const key = parts[0];
    state[key] = parts.slice(1);
  });
  return state;
}

async function readTrickleState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(/\s+/);
    const key = parts[0];
    const metrics = parts.slice(1).map(v => parseInt(v.trim(), 10) || 0);
    state[key] = metrics;
  });
  return state;
}

async function readSpaceState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(/\s+/);
    const key = parts[0];
    const metrics = parts.slice(1).map(v => {
      if (v === "-") return 0;
      return parseInt(v.trim(), 10) || 0;
    });
    state[key] = metrics;
  });
  return state;
}

async function readbranchlogin(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  state["branch login no"] = content;
  return state;
}
async function readtellerlogin(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  state["teller login no"] = content;
  return state;
}
async function readreposting(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  state["reposting no"] = content;
  return state;
}

// --------------------------------------------------
// Watcher Factory (Now Per-Source Clients)
// --------------------------------------------------

function createWatcher(name, filePath, readerFn) {
  let prevState = {};
  let debounceTimer = null;
  const clients = new Set();

  function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      res.write(payload);
    }
    backendEmitter.emit("change", { source: name, event, data });
  }

  async function processFileChange() {
    try {
      const currState = await readerFn(filePath);
      const deltas = diffStates(prevState, currState);

      deltas.forEach(delta => broadcast("delta", delta));

      prevState = currState;

    } catch (err) {
      broadcast("error", { error: err.message });
    }
  }

  function start() {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    readerFn(filePath).then(state => {
      prevState = state;
    });

    fs.watch(filePath, (eventType) => {
      if (eventType === "change") {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(processFileChange, 100);
      }
    });

    console.log(`${name} watcher started`);
  }

  function addClient(res) {
    clients.add(res);
  }

  function removeClient(res) {
    clients.delete(res);
  }

  function getState() {
    return prevState;
  }

  return {
    start,
    addClient,
    removeClient,
    getState
  };
}

// --------------------------------------------------
// File Configuration
// --------------------------------------------------

const FILE_CONFIG = [
  { name: "jobs", path: "files/jobs_list.txt", reader: readJobsState },
  { name: "queue", path: "files/queue_file.txt", reader: readQueueState },
  { name: "payments", path: "files/payment.txt", reader: readPaymentsState }, // still present for future config if needed
  { name: "context", path: "files/context.txt", reader: readContextState },
  { name: "trickle", path: "files/trickle.txt", reader: readTrickleState },
  { name: "space", path: "files/space.txt", reader: readSpaceState },
  { name: "branchlogin", path: "files/branchlogin.txt", reader: readbranchlogin },
  { name: "tellerlogin", path: "files/tellerlogin.txt", reader: readtellerlogin },
  { name: "repostng", path: "files/reposting.txt", reader: readreposting },
];
const watchers = {};

FILE_CONFIG.forEach(config => {
  const fullPath = path.join(__dirname, config.path);
  const watcher = createWatcher(config.name, fullPath, config.reader);
  watcher.start();
  watchers[config.name] = watcher;
});

// --------------------------------------------------
// Dynamic Per-File SSE Route
// --------------------------------------------------

app.get("/events/:source", (req, res) => {

  const { source } = req.params;
  const watcher = watchers[source];

  if (!watcher) {
    return res.status(404).json({ error: "Invalid source" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();
  watcher.addClient(res);

  // Send initial snapshot for this file only
  res.write(`event: snapshot\ndata: ${JSON.stringify(watcher.getState())}\n\n`);

  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(pingInterval);
    watcher.removeClient(res);
  });
});

// --------------------------------------------------
// Unified SSE Route (Solves browser connection limits)
// --------------------------------------------------

app.get("/events-unified", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();

  // Send initial snapshot for all watchers
  FILE_CONFIG.forEach(config => {
    const watcher = watchers[config.name];
    if (watcher) {
      res.write(`event: ${config.name}\ndata: ${JSON.stringify({ type: "snapshot", payload: watcher.getState() })}\n\n`);
    }
  });

  const onChange = ({ source, event, data }) => {
    res.write(`event: ${source}\ndata: ${JSON.stringify({ type: event, payload: data })}\n\n`);
  };

  backendEmitter.on("change", onChange);

  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(pingInterval);
    backendEmitter.off("change", onChange);
  });
});

// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`SSE server running at http://localhost:${PORT}`);
});