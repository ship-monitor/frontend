// Web Storage может быть недоступен (приватный режим, политики браузера) —
// все обращения обёрнуты в try/catch и тихо деградируют.
const safeStorage = {
  getJson(key: string): unknown {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* */
    }
  },
};

export default safeStorage;
