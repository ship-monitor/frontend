export interface SensorConfig {
    id: string;
    deviceId: string;
    name: string;
    minThreshold: number;      // Нижняя граница (например -17)
    maxThreshold: number;      // Верхняя граница (например -15)
    phoneNumber: string;       // Номер для SMS
    defrostTime: number;       // Время оттайки в минутах
    defrostTemperature: number; // Температура при оттайке (например -9)
    tags: string[];            // Теги: ["3 помещение", "рыба"]
    createdAt: string;
    updatedAt: string;
}

export interface SensorData {
    id: string;
    deviceId: string;
    value: number;
    timestamp: string;
    isDefrostMode: boolean;    // В режиме оттайки или нет
    isAlert: boolean;          // Авария (не вернулась после оттайки)
}

export interface SensorHistory {
    data: SensorData[];
    startDate: string;
    endDate: string;
}