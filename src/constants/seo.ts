import type { AppLocale } from "@/i18n";

export const SITE_URL = "https://ship-monitor.ru";

export type SeoMeta = {
  siteName: string;
  title: string;
  description: string;
  canonicalPath: string;
  ogLocale: string;
};

export const SEO: Record<AppLocale, SeoMeta> = {
  ru: {
    siteName: "ШиП-Монитор",
    title: "ШиП-Монитор — система мониторинга холодильного оборудования",
    description:
      "🌡️ Контроль температуры холодильного оборудования 24/7: датчики и контроллер ШиП-Монитор. Уведомления при выходе за границы — на сайт, push или SMS. Автоматический журнал ХАССП.",
    canonicalPath: "/",
    ogLocale: "ru_RU",
  },
  en: {
    siteName: "Ship-Monitor",
    title: "Ship-Monitor — Cold Chain Temperature Monitoring",
    description:
      "Industrial refrigeration controller and wireless temperature sensors for cold rooms and warehouses: 24/7 monitoring, 12 months of history and alerts via web, push or SMS.",
    canonicalPath: "/en/",
    ogLocale: "en_US",
  },
};

export const SEO_PAGES: Record<string, SeoMeta> = {
  ZhurnalTemperatur: {
    siteName: "ШиП-Монитор",
    title: "Журнал учета температуры холодильного оборудования — ШиП-Монитор",
    description:
      "🌡️ Автоматический журнал учета температуры холодильного оборудования по СанПиН 2.3/2.4.4282-26. Датчики фиксируют температуру 24/7, отчёт для проверки — в один клик. Без ручных замеров.",
    canonicalPath: "/zhurnal-temperatur",
    ogLocale: "ru_RU",
  },
  Apteki: {
    siteName: "ШиП-Монитор",
    title: "Контроль температуры в аптеке — система мониторинга | ШиП-Монитор",
    description:
      "🌡️ Система контроля температуры в аптеке: датчики для холодильников с термолабильными препаратами, режим +2…+8 °C, уведомления при выходе за границы и отчёты для проверок в один клик.",
    canonicalPath: "/apteki",
    ogLocale: "ru_RU",
  },
  Restorany: {
    siteName: "ШиП-Монитор",
    title: "Мониторинг температуры для ресторанов и кафе — ХАССП | ШиП-Монитор",
    description:
      "🌡️ Контроль температуры холодильного оборудования в ресторанах и кафе: автоматический журнал ХАССП, SMS при выходе за порог, все камеры на одном экране.",
    canonicalPath: "/restorany",
    ogLocale: "ru_RU",
  },
  Sklady: {
    siteName: "ШиП-Монитор",
    title: "Мониторинг температуры склада и холодильных камер | ШиП-Монитор",
    description:
      "🌡️ Система мониторинга температуры на складе: до 15 холодильных камер на один хаб, беспроводные LoRa-датчики без кабелей, история за 12 месяцев и уведомления push/SMS.",
    canonicalPath: "/sklady",
    ogLocale: "ru_RU",
  },
  Refrizheratory: {
    siteName: "ШиП-Монитор",
    title: "Мониторинг рефрижераторов — датчики температуры | ШиП-Монитор",
    description:
      "🌡️ Датчики температуры для рефрижераторов: запись в пути не прерывается даже при заглушённом двигателе, онлайн-доступ и SMS-уведомления о выходе за границы.",
    canonicalPath: "/refrizheratory",
    ogLocale: "ru_RU",
  },
};
