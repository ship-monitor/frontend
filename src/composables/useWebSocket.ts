import { ref, onUnmounted, type Ref } from "vue";

export interface WsCommand {
    deviceId: string;
    action: string;
    payload?: Record<string, unknown>;
}

export interface WsMessage {
    type: "device_status" | "sensor_data" | "command_result" | "error";
    deviceId?: string;
    data?: {
        connected?: boolean;
        value?: number;
        minThreshold?: number;
        maxThreshold?: number;
        isDefrostMode?: boolean;
        isAlert?: boolean;
    };
    message?: string;
}

interface UseWebSocketOptions {
    url: string;
    token: string;
    onMessage?: (message: WsMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions) {
    const {
        url,
        token,
        onMessage,
        onOpen,
        onClose,
        onError,
        reconnectInterval = 5000,
        maxReconnectAttempts = 10,
    } = options;

    const isConnected: Ref<boolean> = ref(false);
    const deviceStatuses: Ref<Map<string, "online" | "offline">> = ref(new Map());
    const sensorData: Ref<
        Map<string, { value: number; minThreshold?: number; maxThreshold?: number; isDefrostMode?: boolean; isAlert?: boolean }>
    > = ref(new Map());

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;

    // ============ Подключение ============
    function connect() {
        if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
            return;
        }

        ws = new WebSocket(`${url}?token=${token}`);

        ws.onopen = () => {
            console.log("[WebSocket] Connected");
            isConnected.value = true;
            reconnectAttempts = 0;

            // Пинг для поддержания соединения
            pingInterval = setInterval(() => {
                if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "ping" }));
                }
            }, 30000);

            onOpen?.();
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const message: WsMessage = JSON.parse(event.data);

                // Обновляем статусы устройств
                if (message.type === "device_status" && message.deviceId) {
                    const status = message.data?.connected ? "online" : "offline";
                    deviceStatuses.value.set(message.deviceId, status);
                }

                // Обновляем показания датчиков
                if (message.type === "sensor_data" && message.deviceId && message.data) {
                    sensorData.value.set(message.deviceId, {
                        value: message.data.value ?? 0,
                        minThreshold: message.data.minThreshold,
                        maxThreshold: message.data.maxThreshold,
                        isDefrostMode: message.data.isDefrostMode,
                        isAlert: message.data.isAlert,
                    });
                }

                onMessage?.(message);
            } catch (e) {
                console.error("[WebSocket] Failed to parse message:", e);
            }
        };

        ws.onclose = (event: CloseEvent) => {
            console.log("[WebSocket] Disconnected:", event.code, event.reason);
            isConnected.value = false;

            if (pingInterval) {
                clearInterval(pingInterval);
                pingInterval = null;
            }

            onClose?.();

            // Автопереподключение
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(
                    `[WebSocket] Reconnecting attempt ${reconnectAttempts}/${maxReconnectAttempts}...`
                );
                reconnectTimer = setTimeout(connect, reconnectInterval);
            }
        };

        ws.onerror = (error: Event) => {
            console.error("[WebSocket] Error:", error);
            onError?.(error);
        };
    }

    // ============ Подписка на устройство ============
    function subscribe(deviceId: string) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("[WebSocket] Cannot subscribe — not connected");
            return false;
        }

        ws.send(
            JSON.stringify({
                type: "subscribe",
                deviceId: deviceId,
            })
        );

        return true;
    }

    // ============ Отправка команды ============
    function sendCommand(command: WsCommand): boolean {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("[WebSocket] Cannot send command — not connected");
            return false;
        }

        ws.send(
            JSON.stringify({
                type: "command",
                deviceId: command.deviceId,
                action: command.action,
                payload: command.payload || {},
                timestamp: Date.now(),
            })
        );

        return true;
    }

    // ============ Отключение ============
    function disconnect() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }

        if (ws) {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onclose = null;
            ws.onerror = null;
            ws.close();
            ws = null;
        }

        isConnected.value = false;
    }

    // ============ Очистка при уничтожении компонента ============
    onUnmounted(() => {
        disconnect();
    });

    return {
        isConnected,
        deviceStatuses,
        sensorData,
        connect,
        disconnect,
        sendCommand,
        subscribe,
    };
}