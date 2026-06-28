export interface SensorConfig {
  id: string;
  deviceId: string;
  name: string;
  /**
   * Нижняя граница (например -17)
   */
  minThreshold: number;
  /**
   * Верхняя граница (например -15)
   */
  maxThreshold: number;
  /**
   * Номер для SMS
   */
  phoneNumber: string;
  /**
   * Время оттайки в минутах
   */
  defrostTime: number;
  /**
   * Температура при оттайке (например -9)
   */
  defrostTemperature: number;
  /**
   * Теги: ["3 помещение", "рыба"]
   */
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SensorData {
  id: string;
  deviceId: string;
  value: number;
  timestamp: string;
  /**
   * В режиме оттайки или нет
   */
  isDefrostMode: boolean;
  /**
   * Авария (не вернулась после оттайки)
   */
  isAlert: boolean;
}

export interface SensorHistory {
  data: SensorData[];
  startDate: string;
  endDate: string;
}
