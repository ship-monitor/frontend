/**
 * Ship Monitor
 * 2.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "@oazapfts/runtime";
import * as QS from "@oazapfts/runtime/query";
export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
    headers: {},
    baseUrl: "http://localhost:8080"
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    localDevelopmentServer: "http://localhost:8080",
    productionServer: "https://api.ship-monitor.ru"
};
export type ServiceStatus = "ok" | "warn" | "fail";
export type Problem = {
    "type": string;
    title: string;
    status: number;
    detail?: string;
};
export type RegisterForm = {
    email: string;
    password: string;
    name: string;
};
export type Device = {
    id: string;
    name: string;
    ownerId: string;
};
export type Sensor = {
    id: string;
    name: string;
    deviceId: string;
    displayName: string;
};
export type MetricType = "GAUGE" | "COUNTER" | "HISTOGRAM";
export type Metric = {
    name: string;
    "type": MetricType;
    unit: string;
    value: number;
    /** The UTC timestamp when metric was captured */
    timestamp: string;
};
export type Metrics = {
    name: string;
    "type": MetricType;
    unit: string;
    values: Metric[];
};
export function getHealth(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: {
            status: ServiceStatus;
        };
    } | {
        status: number;
        data: Problem;
    }>("/api/v2/health", {
        ...opts
    });
}
export function registerUser(registerForm: RegisterForm, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 201;
    } | {
        status: number;
        data: Problem;
    }>("/api/v2/auth/register", oazapfts.json({
        ...opts,
        method: "POST",
        body: registerForm
    }));
}
export function loginUser(body: {
    email: string;
    password: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: {
            success: boolean;
            token: string;
            refreshToken: string;
        };
    } | {
        status: number;
        data: Problem;
    }>("/api/v2/auth/login", oazapfts.json({
        ...opts,
        method: "POST",
        body
    }));
}
export function refreshToken(body: {
    refreshToken: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: {
            success: boolean;
            token: string;
            refreshToken: string;
        };
    } | {
        status: number;
        data: Problem;
    }>("/api/v2/auth/refresh", oazapfts.json({
        ...opts,
        method: "POST",
        body
    }));
}
export function getDevices({ page, pageSize }: {
    page?: number;
    pageSize?: number;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: {
            devices: Device[];
        };
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices${QS.query(QS.explode({
        page,
        pageSize
    }))}`, {
        ...opts
    });
}
export function connectDevice(body: {
    deviceId: string;
    securityKey: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 201;
    } | {
        status: 409;
        data: Problem;
    } | {
        status: number;
        data: Problem;
    }>("/api/v2/devices", oazapfts.json({
        ...opts,
        method: "POST",
        body
    }));
}
export function getDevice(deviceId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Device;
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices/${encodeURIComponent(deviceId)}`, {
        ...opts
    });
}
export function editDevice(deviceId: string, body: {
    name: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices/${encodeURIComponent(deviceId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body
    }));
}
export function removeDevice(deviceId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices/${encodeURIComponent(deviceId)}`, {
        ...opts,
        method: "DELETE"
    });
}
export function getDeviceOnlineStatus(deviceId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: {
            online: boolean;
            lastSeen: number;
        };
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices/${encodeURIComponent(deviceId)}/online`, {
        ...opts
    });
}
export function getSensors(deviceId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: {
            sensors: Sensor[];
        };
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices/${encodeURIComponent(deviceId)}/sensors`, {
        ...opts
    });
}
export function editSensor(deviceId: string, sensorId: string, body: {
    displayName: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: {
            sensor: Sensor;
        };
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices/${encodeURIComponent(deviceId)}/sensors/${encodeURIComponent(sensorId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body
    }));
}
export function getSensorMetrics(deviceId: string, sensorId: string, $from: string, to: string, metric: string, { limit }: {
    limit?: number;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Metrics;
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices/${encodeURIComponent(deviceId)}/sensors/${encodeURIComponent(sensorId)}/metrics${QS.query(QS.explode({
        "from": $from,
        to,
        metric,
        limit
    }))}`, {
        ...opts
    });
}
export function getDeviceMetrics(deviceId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Metrics;
    } | {
        status: number;
        data: Problem;
    }>(`/api/v2/devices/${encodeURIComponent(deviceId)}/metrics`, {
        ...opts
    });
}
