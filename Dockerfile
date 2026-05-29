# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение, пропуская проверку типов
RUN npm run build-only

# Устанавливаем простой HTTP сервер для раздачи статики
RUN npm install -g serve

# Открываем порт
EXPOSE 3000

# Запускаем serve для раздачи собранного приложения
CMD ["serve", "-s", "dist", "-l", "3000"]