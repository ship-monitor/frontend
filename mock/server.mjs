import http from "node:http";
import { Buffer } from "node:buffer";
import fs from "node:fs";

const PORT = 8080;
const UPSTREAM = "https://ship-monitor.ru";
const ALLOWED_ORIGIN = "http://localhost:5173";

const DEVICE_PASSWORD = "password";
const BUILTIN_DEVICES = [
  "53c14690-602d-4b1e-aebf-0d46c7c571b1",
  "34c1472f-62bb-4a94-9fa3-4ed0b3fe3a6a",
  "a408fee1-21f3-40a2-9dab-9669c7e06502",
  "23bbdcf8-0911-471a-98e5-212a824276b7",
  "e0ba8117-6599-4be4-8709-5931b9020aa8",
  "e7eb1084-271b-49ab-a5be-1e9e8d8072eb",
  "a8eb9e7b-458a-4008-a57e-c940e7b20d37",
  "2138a217-760b-4218-9509-0cb98b126ad6",
  "232af659-7326-4468-8040-e007f2a853eb",
  "d99c8a6e-9602-4fed-a20a-cbbd6db954fb",
];

const seedDevices = [
  [
    "a408fee1-21f3-40a2-9dab-9669c7e06502",
    {
      id: "a408fee1-21f3-40a2-9dab-9669c7e06502",
      model: "Ship 0.1 (test)",
      ownerId: "mock-user",
      name: "Морозильная камера",
    },
  ],
  [
    "23bbdcf8-0911-471a-98e5-212a824276b7",
    {
      id: "23bbdcf8-0911-471a-98e5-212a824276b7",
      model: "Ship 0.1 (test)",
      ownerId: "mock-user",
      name: "Холодильник №1",
    },
  ],
];

const STORE_FILE = new URL("./store.json", import.meta.url);

const loadConnected = () => {
  try {
    const saved = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    if (Array.isArray(saved) && saved.length > 0) {
      return new Map(saved.map((d) => [d.id, d]));
    }
  } catch {
    /* */
  }
  return new Map(seedDevices);
};

const connected = loadConnected();

const persist = () => {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify([...connected.values()], null, 2));
  } catch {
    /* */
  }
};

const baseTemp = (id) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return -12 - (h % 12);
};

const tempPoints = (id, count) => {
  const base = baseTemp(id);
  const now = Date.now();
  const points = [];
  for (let i = count - 1; i >= 0; i--) {
    const t = now - i * 60_000;
    const value =
      base + 2 * Math.sin(t / 600_000) + 0.4 * Math.sin(t / 90_000 + base);
    points.push({
      state: "temperature",
      value: Number(value.toFixed(2)),
      timestamp: new Date(t).toISOString(),
      deviceId: id,
    });
  }
  return points;
};

const setCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Vary", "Origin");
};

const send = (res, status, body) => {
  setCors(res);
  res.statusCode = status;
  if (body === undefined) {
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });

const parseJson = (body) => {
  try {
    return JSON.parse(body.toString() || "{}");
  } catch {
    return {};
  }
};

const handleDevicesApi = async (req, res, body) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;

  if (req.method === "GET" && path === "/api/v2/devices") {
    send(res, 200, { result: [...connected.values()] });
    return true;
  }

  if (req.method === "POST" && path === "/api/v2/devices/connect") {
    const { deviceId, password, name } = parseJson(body);
    if (!BUILTIN_DEVICES.includes(deviceId)) {
      send(res, 404, { details: "device not found" });
      return true;
    }
    if (password !== DEVICE_PASSWORD) {
      send(res, 403, { details: "invalid device password" });
      return true;
    }
    if (connected.has(deviceId)) {
      send(res, 409, { details: "device already connected" });
      return true;
    }
    connected.set(deviceId, {
      id: deviceId,
      model: "Ship 0.1 (test)",
      ownerId: "mock-user",
      name: name || deviceId.slice(0, 8),
    });
    persist();
    send(res, 201);
    return true;
  }

  const stateMatch = path.match(
    /^\/api\/v2\/devices\/([0-9a-f-]+)\/state\/([a-z]+)$/
  );
  if (req.method === "GET" && stateMatch) {
    const [, deviceId, state] = stateMatch;
    const history = Math.max(1, Number(url.searchParams.get("history")) || 1);
    if (state === "temperature") {
      send(res, 200, { result: tempPoints(deviceId, history) });
    } else {
      send(res, 200, {
        result: [
          {
            state,
            value: true,
            timestamp: new Date().toISOString(),
            deviceId,
          },
        ],
      });
    }
    return true;
  }

  const commandMatch = path.match(/^\/api\/v2\/devices\/([0-9a-f-]+)\/command$/);
  if (req.method === "POST" && commandMatch) {
    send(res, 200);
    return true;
  }

  const deviceMatch = path.match(/^\/api\/v2\/devices\/([0-9a-f-]+)$/);
  if (deviceMatch) {
    const [, deviceId] = deviceMatch;
    const device = connected.get(deviceId);
    if (!device) {
      send(res, 404, { details: "device not found" });
      return true;
    }
    if (req.method === "GET") {
      send(res, 200, { result: device });
      return true;
    }
    if (req.method === "PATCH") {
      const { name } = parseJson(body);
      if (typeof name === "string" && name.trim() !== "") {
        connected.set(deviceId, { ...device, name: name.trim() });
        persist();
      }
      send(res, 204);
      return true;
    }
  }

  return false;
};

const proxy = async (req, res, body) => {
  const headers = {};
  const skip = new Set([
    "host",
    "origin",
    "referer",
    "accept-encoding",
    "connection",
    "content-length",
  ]);
  for (const [key, value] of Object.entries(req.headers)) {
    if (skip.has(key)) continue;
    headers[key] = Array.isArray(value) ? value.join(", ") : value;
  }

  try {
    const upstream = await fetch(UPSTREAM + req.url, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      redirect: "manual",
    });

    res.statusCode = upstream.status;
    const skipResponse = new Set([
      "set-cookie",
      "access-control-allow-origin",
      "access-control-allow-credentials",
      "access-control-allow-headers",
      "access-control-allow-methods",
      "content-encoding",
      "content-length",
      "transfer-encoding",
      "vary",
    ]);
    upstream.headers.forEach((value, key) => {
      if (skipResponse.has(key)) return;
      res.setHeader(key, value);
    });
    setCors(res);
    const cookies = upstream.headers.getSetCookie?.() ?? [];
    if (cookies.length > 0) {
      res.setHeader("Set-Cookie", cookies);
    }
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    send(res, 502, { details: `proxy error: ${error.message}` });
  }
};

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin ?? "-";
  res.on("finish", () => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} -> ${res.statusCode} [${origin}]`);
  });

  try {
    if (req.method === "OPTIONS") {
      send(res, 204);
      return;
    }

    const body = await readBody(req);

    if (req.url.startsWith("/api/v2/devices")) {
      const handled = await handleDevicesApi(req, res, body);
      if (handled) return;
    }

    await proxy(req, res, body);
  } catch (error) {
    send(res, 500, { details: `mock error: ${error.message}` });
  }
});

server.listen(PORT, () => {
  console.log(`mock api on http://localhost:${PORT}, upstream ${UPSTREAM}`);
});
