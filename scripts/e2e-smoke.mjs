#!/usr/bin/env node
// Stand smoke check: verifies the live stack (backend, auth, devices,
// metrics) in one command. Not a unit test — hits the real API.
//
// Usage:
//   npm run e2e:smoke
//   API_URL=http://localhost:6767 npm run e2e:smoke
//
// Login credentials are read from the JSON file used on this machine
// (os.tmpdir()/kilo/login.json, fields email/password) or from
// E2E_EMAIL / E2E_PASSWORD environment variables.

import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE_URL = process.env.API_URL ?? "http://localhost:6767";

const fail = (message) => {
  console.error(`[FAIL] ${message}`);
  process.exit(1);
};

const ok = (message) => console.log(`[ok] ${message}`);

function readCredentials() {
  if (process.env.E2E_EMAIL && process.env.E2E_PASSWORD) {
    return { email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD };
  }
  const file = path.join(os.tmpdir(), "kilo", "login.json");
  try {
    const raw = JSON.parse(readFileSync(file, "utf8"));
    if (typeof raw.email === "string" && typeof raw.password === "string") {
      return { email: raw.email, password: raw.password };
    }
  } catch {
    // fall through
  }
  return null;
}

async function call(pathname, { token, ...options } = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${pathname}`, { ...options, headers });
  let data = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON body
  }
  return { status: response.status, data };
}

// 1. Health (no auth).
const health = await call("/api/v2/health");
if (health.status !== 200 || health.data?.status !== "ok") {
  fail(`health: expected 200 {"status":"ok"}, got ${health.status} ${JSON.stringify(health.data)}`);
}
ok(`health: ${JSON.stringify(health.data)}`);

// 2. Login.
const credentials = readCredentials();
if (!credentials) {
  fail("login: no credentials — create os.tmpdir()/kilo/login.json or set E2E_EMAIL/E2E_PASSWORD");
}
const login = await call("/api/v2/auth/login", {
  method: "POST",
  body: JSON.stringify(credentials),
});
if (login.status !== 200 || typeof login.data?.token !== "string") {
  fail(`login: expected 200 with token, got ${login.status} ${JSON.stringify(login.data)}`);
}
ok(`login: ${credentials.email}`);

// 3. Devices.
const devices = await call("/api/v2/devices?page=0&pageSize=10", { token: login.data.token });
if (devices.status !== 200 || !Array.isArray(devices.data?.devices)) {
  fail(`devices: expected 200 with devices[], got ${devices.status}`);
}
const list = devices.data.devices;
if (list.length === 0) {
  fail("devices: none registered — connect the hub first");
}
const device = list[0];
ok(`devices: ${list.length} (${device.id})`);

const from = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const to = new Date().toISOString();

// 4. Device metrics (battery).
const battery = await call(
  `/api/v2/devices/${device.id}/metrics/battery-level?from=${from}&to=${to}&limit=1000`,
  { token: login.data.token },
);
if (battery.status !== 200 || !Array.isArray(battery.data?.values)) {
  fail(`battery-level: expected 200 with values[], got ${battery.status}`);
}
const lastBattery = battery.data.values.at(-1);
ok(
  lastBattery
    ? `battery-level: ${lastBattery.value} @ ${lastBattery.timestamp} (points: ${battery.data.values.length})`
    : "battery-level: no points in the last hour",
);

// 5. Sensors and temperature.
const sensors = await call(`/api/v2/devices/${device.id}/sensors`, {
  token: login.data.token,
});
if (sensors.status !== 200 || !Array.isArray(sensors.data?.sensors)) {
  fail(`sensors: expected 200 with sensors[], got ${sensors.status}`);
}
if (sensors.data.sensors.length === 0) {
  fail("sensors: none declared — is the hub running?");
}
const sensor = sensors.data.sensors[0];
ok(`sensors: ${sensors.data.sensors.length} (${sensor.name})`);

const temperature = await call(
  `/api/v2/devices/${device.id}/sensors/${sensor.id}/metrics/temperature?from=${from}&to=${to}&limit=1000`,
  { token: login.data.token },
);
if (temperature.status !== 200 || !Array.isArray(temperature.data?.values)) {
  fail(
    `sensor temperature: expected 200 with values[], got ${temperature.status} ${JSON.stringify(temperature.data)}`,
  );
}
const lastTemperature = temperature.data.values.at(-1);
if (!lastTemperature) {
  fail("sensor temperature: no points in the last hour — declaration sync broken?");
}
ok(
  `sensor temperature: ${lastTemperature.value}${temperature.data.unit ?? ""} @ ${lastTemperature.timestamp} (points: ${temperature.data.values.length})`,
);

console.log("\nStand is healthy.");
