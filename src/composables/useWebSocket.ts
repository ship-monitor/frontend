import { ref, onUnmounted, type Ref } from "vue";

export interface WsCommand {
    deviceId: string;
    action: string;
    payload?: Record<string, unknown>;
}

export interface WsMessage {
    type: "device_status" | "sensor_data" | "temperature" | "command_result" | "error" | "pong";
    deviceId?: string;
    data?: {
        connected?: boolean;       // устаревшее, оставлено для обратной совместимости
        isConnected?: boolean;     // новое поле статуса
        value?: number;            // температура
        temperature?: number;      // температура (альтернативное имя)
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
        reconnectInterval = 3000,
        maxReconnectAttempts = 20,
    } = options;

    const isConnected: Ref<boolean> = ref(false);

    // Статусы устройств: "Подключено" | "Отключено"
    const deviceStatuses: Ref<Map<string, "Подключено" | "Отключено">> = ref(new Map());

    // Данные датчиков (температура и доп. параметры)
    const sensorData: Ref<
        Map<string, {
            value: number;
            minThreshold?: number;
            maxThreshold?: number;
            isDefrostMode?: boolean;
            isAlert?: boolean;
        }>
    > = ref(new Map());

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let lastPongTime: number = Date.now();

    // Таймер для периодического запроса температуры
    let temperatureInterval: ReturnType<typeof setInterval> | null = null;
    // Список устройств, для которых запрашиваем температуру
    const subscribedDevices: Set<string> = new Set();

    // ============ Подключение ============
    function connect() {
        if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
            return;
        }

        const wsUrl = `${url}?token=${token}`;
        console.log("[WebSocket] Connecting to:", wsUrl);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("[WebSocket] Connected");
            isConnected.value = true;
            reconnectAttempts = 0;
            lastPongTime = Date.now();

            // Пинг каждые 25 секунд для поддержания соединения
            if (pingInterval) clearInterval(pingInterval);
            pingInterval = setInterval(() => {
                if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "ping" }));

                    if (Date.now() - lastPongTime > 35000) {
                        console.log("[WebSocket] No pong received, reconnecting...");
                        disconnect();
                        connect();
                    }
                }
            }, 25000);

            // Периодический запрос температуры для подписанных устройств
            if (temperatureInterval) clearInterval(temperatureInterval);
            temperatureInterval = setInterval(() => {
                subscribedDevices.forEach((deviceId) => {
                    requestTemperature(deviceId);
                });
            }, 10000); // Каждые 10 секунд

            onOpen?.();
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const message: WsMessage = JSON.parse(event.data);

                // Ответ на пинг
                if (message.type === "pong") {
                    lastPongTime = Date.now();
                    return;
                }

                // Обновляем статусы устройств
                if (message.type === "device_status" && message.deviceId) {
                    // Поддерживаем оба поля: isConnected (новое) и connected (старое)
                    const isDeviceConnected = message.data?.isConnected ?? message.data?.connected ?? false;
                    const status = isDeviceConnected ? "Подключено" : "Отключено";
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

                // Обработка ответа на команду get-temperature
                if (message.type === "temperature" && message.deviceId && message.data) {
                    const tempValue = message.data.temperature ?? message.data.value ?? 0;
                    const existingData = sensorData.value.get(message.deviceId);
                    sensorData.value.set(message.deviceId, {
                        value: tempValue,
                        minThreshold: message.data.minThreshold ?? existingData?.minThreshold,
                        maxThreshold: message.data.maxThreshold ?? existingData?.maxThreshold,
                        isDefrostMode: message.data.isDefrostMode ?? existingData?.isDefrostMode,
                        isAlert: message.data.isAlert ?? existingData?.isAlert,
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

            if (temperatureInterval) {
                clearInterval(temperatureInterval);
                temperatureInterval = null;
            }

            onClose?.();

            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(
                    `[WebSocket] Reconnecting attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${reconnectInterval}ms...`
                );
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(connect, reconnectInterval);
            } else {
                console.log("[WebSocket] Max reconnection attempts reached");
            }
        };

        ws.onerror = (error: Event) => {
            console.error("[WebSocket] Error:", error);
            onError?.(error);
        };
    }

    // ============ Подписка на устройство ============
    function subscribe(deviceId: string) {
        subscribedDevices.add(deviceId);

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("[WebSocket] Cannot subscribe — not connected");
            return false;
        }

        ws.send(JSON.stringify({
            type: "subscribe",
            deviceId: deviceId,
        }));

        // Сразу запрашиваем температуру после подписки
        requestTemperature(deviceId);

        return true;
    }

    // ============ Отписка от устройства ============
    function unsubscribe(deviceId: string) {
        subscribedDevices.delete(deviceId);

        if (!ws || ws.readyState !== WebSocket.OPEN) return false;

        ws.send(JSON.stringify({
            type: "unsubscribe",
            deviceId: deviceId,
        }));

        return true;
    }

    // ============ Запрос температуры ============
    function requestTemperature(deviceId: string): boolean {
        if (!ws || ws.readyState !== WebSocket.OPEN) return false;

        ws.send(JSON.stringify({
            type: "command",
            deviceId: deviceId,
            action: "get-temperature",
            payload: {},
            timestamp: Date.now(),
        }));

        return true;
    }

    // ============ Отправка команды ============
    function sendCommand(command: WsCommand): boolean {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("[WebSocket] Cannot send command — not connected");
            return false;
        }

        ws.send(JSON.stringify({
            type: "command",
            deviceId: command.deviceId,
            action: command.action,
            payload: command.payload || {},
            timestamp: Date.now(),
        }));

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

        if (temperatureInterval) {
            clearInterval(temperatureInterval);
            temperatureInterval = null;
        }

        subscribedDevices.clear();

        if (ws) {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onclose = null;
            ws.onerror = null;
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
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
        unsubscribe,
        requestTemperature,
    };
}