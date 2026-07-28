<script setup lang="ts">
</script>

<template>
  <!-- Каталог устройств -->
  <section id="devices" class="py-20 md:py-28 lg:py-32 bg-white">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <header class="mb-12 grid gap-6 md:mb-16 md:grid-cols-[0.8fr_1fr] md:items-end">
        <div>
          <p class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-electric-blue">Оборудование</p>
          <h2 class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl">Устройства</h2>
        </div>
        <p class="max-w-xl text-base leading-7 text-moonless-night/50 md:justify-self-end md:text-lg">
          Датчики передают показания в облачную систему и продолжают контролировать объект даже при нестабильном подключении.
        </p>
      </header>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <!-- Устройство 1 -->
        <article class="bg-cotton overflow-hidden rounded-[26px] border border-moonless-night/10">
          <div class="grid min-h-[310px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(52,120,212,0.14),transparent_58%)]">
            <div class="relative h-[145px] w-[110px] rotate-[-5deg] rounded-3xl border-[7px] border-[#252525] bg-white px-4 py-6 shadow-2xl">
              <span class="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-electric-blue"></span>
              <div class="mt-9 grid h-14 place-items-center rounded-lg bg-[#1e2633] font-mono text-lg text-[#9ec5ff]">+4.2°</div>
              <span class="absolute bottom-5 left-5 font-extrabold">ШиП</span>
            </div>
          </div>
          <div class="p-6 sm:p-8">
            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-electric-blue">Датчик температуры</p>
            <h3 class="text-3xl font-bold">ШиП T1</h3>
            <p class="mt-4 leading-7 text-moonless-night/50">Компактный датчик для холодильных камер, складов, аптек и производственных помещений.</p>
            <dl class="mt-7 grid grid-cols-3 gap-3">
              <div><dt class="mb-1 text-xs text-moonless-night/50">Диапазон</dt><dd class="text-sm font-semibold">−40…+85 °C</dd></div>
              <div><dt class="mb-1 text-xs text-moonless-night/50">Связь</dt><dd class="text-sm font-semibold">Wi-Fi</dd></div>
              <div><dt class="mb-1 text-xs text-moonless-night/50">Питание</dt><dd class="text-sm font-semibold">USB-C</dd></div>
            </dl>
            <div class="mt-8 flex items-center justify-between border-t border-moonless-night/10 pt-6">
              <strong class="text-xl">от 4 900 ₽</strong>
              <a href="#lead-form" class="group inline-flex items-center gap-2 font-semibold text-electric-blue">Запросить<span class="transition-transform group-hover:translate-x-1">→</span></a>
            </div>
          </div>
        </article>

        <!-- Устройство 2 -->
        <article class="bg-cotton overflow-hidden rounded-[26px] border border-moonless-night/10">
          <div class="grid min-h-[310px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(52,120,212,0.14),transparent_58%)]">
            <div class="relative h-[160px] w-[210px] rotate-3 rounded-3xl border-[7px] border-[#252525] bg-white px-4 py-6 shadow-2xl">
              <span class="absolute -top-12 right-6 h-12 w-2 rounded-t-full bg-[#252525]"></span>
              <span class="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-electric-blue"></span>
              <div class="mt-8 grid h-12 place-items-center rounded-lg bg-[#1e2633] font-mono text-sm text-[#9ec5ff]">ONLINE</div>
              <span class="absolute bottom-4 left-5 font-extrabold">ШиП</span>
            </div>
          </div>
          <div class="p-6 sm:p-8">
            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-electric-blue">Шлюз мониторинга</p>
            <h3 class="text-3xl font-bold">ШиП Hub</h3>
            <p class="mt-4 leading-7 text-moonless-night/50">Центральный модуль для сбора данных с датчиков и резервной отправки критических SMS.</p>
            <dl class="mt-7 grid grid-cols-3 gap-3">
              <div><dt class="mb-1 text-xs text-moonless-night/50">Каналы</dt><dd class="text-sm font-semibold">Wi-Fi + GSM</dd></div>
              <div><dt class="mb-1 text-xs text-moonless-night/50">Датчики</dt><dd class="text-sm font-semibold">До 32</dd></div>
              <div><dt class="mb-1 text-xs text-moonless-night/50">Резерв</dt><dd class="text-sm font-semibold">До 8 часов</dd></div>
            </dl>
            <div class="mt-8 flex items-center justify-between border-t border-moonless-night/10 pt-6">
              <strong class="text-xl">от 12 900 ₽</strong>
              <a href="#lead-form" class="group inline-flex items-center gap-2 font-semibold text-electric-blue">Запросить<span class="transition-transform group-hover:translate-x-1">→</span></a>
            </div>
          </div>
        </article>

        <!-- Устройство 3 -->
        <article class="overflow-hidden rounded-[26px] border border-moonless-night/10 bg-cotton md:col-span-2 xl:col-span-1">
          <div class="grid min-h-[310px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(52,120,212,0.14),transparent_58%)]">
            <div class="relative h-[180px] w-[250px]">
              <span class="absolute left-5 top-2 h-[120px] w-[90px] -rotate-[8deg] rounded-2xl border-[6px] border-[#242424] bg-white shadow-2xl"></span>
              <span class="absolute left-[91px] top-[100px] h-[70px] w-[130px] rotate-[9deg] rounded-br-[70px] border-b-[5px] border-r-[5px] border-[#242424]"></span>
              <span class="absolute bottom-1 right-2 h-[74px] w-5 rotate-12 rounded-full bg-[#8e9197]"></span>
            </div>
          </div>
          <div class="p-6 sm:p-8">
            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-electric-blue">Выносной термодатчик</p>
            <h3 class="text-3xl font-bold">ШиП Probe</h3>
            <p class="mt-4 leading-7 text-moonless-night/50">Герметичный зонд для измерений внутри холодильников, ёмкостей и других труднодоступных зон.</p>
            <dl class="mt-7 grid grid-cols-3 gap-3">
              <div><dt class="mb-1 text-xs text-moonless-night/50">Защита</dt><dd class="text-sm font-semibold">IP67</dd></div>
              <div><dt class="mb-1 text-xs text-moonless-night/50">Кабель</dt><dd class="text-sm font-semibold">До 5 м</dd></div>
              <div><dt class="mb-1 text-xs text-moonless-night/50">Погрешность</dt><dd class="text-sm font-semibold">±0,3 °C</dd></div>
            </dl>
            <div class="mt-8 flex items-center justify-between border-t border-moonless-night/10 pt-6">
              <strong class="text-xl">от 1 900 ₽</strong>
              <a href="#lead-form" class="group inline-flex items-center gap-2 font-semibold text-electric-blue">Запросить<span class="transition-transform group-hover:translate-x-1">→</span></a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Тарифы -->
  <section id="pricing" class="py-20 md:py-28 lg:py-32">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <header class="mx-auto mb-12 max-w-3xl text-center md:mb-16">
        <p class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-electric-blue">Прозрачные условия</p>
        <h2 class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl">Тарифы</h2>
        <p class="mt-5 text-base leading-7 text-moonless-night/50 md:text-lg">Начните с базового мониторинга и расширяйте систему по мере роста.</p>
      </header>

      <div class="grid gap-5 lg:grid-cols-3 lg:items-stretch">
        <!-- Базовый -->
        <article class="flex min-h-[570px] flex-col justify-between rounded-[26px] border border-moonless-night/10 bg-white/40 p-7 sm:p-9">
          <div>
            <p class="mb-3 text-sm text-moonless-night/50">Для небольших объектов</p>
            <h3 class="text-3xl font-bold">Базовый</h3>
            <div class="my-8 min-h-[70px]">
              <span class="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">990 ₽</span>
              <span class="text-moonless-night/50">/ месяц</span>
            </div>
            <ul class="space-y-4">
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">До 3 подключённых устройств</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">Хранение истории за 30 дней</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">Уведомления в Telegram и по email</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">Один объект мониторинга</li>
            </ul>
          </div>
          <a href="#lead-form" class="mt-10 inline-flex min-h-13 items-center justify-center rounded-full border border-moonless-night/15 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-moonless-night">Подключить</a>
        </article>

        <!-- Надёжный -->
        <article class="relative flex min-h-[570px] flex-col justify-between rounded-[26px] border border-moonless-night bg-moonless-night p-7 text-white shadow-xl sm:p-9 lg:-translate-y-4">
          <span class="absolute right-6 top-6 rounded-full bg-white px-3 py-2 text-xs font-bold uppercase text-moonless-night">Популярный</span>
          <div>
            <p class="mb-3 text-sm text-white/60">Для бизнеса</p>
            <h3 class="text-3xl font-bold">Надёжный</h3>
            <div class="my-8 min-h-[70px]">
              <span class="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">2 490 ₽</span>
              <span class="text-white/60">/ месяц</span>
            </div>
            <ul class="space-y-4">
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-[#8dbbf6] before:content-['✓']">До 15 подключённых устройств</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-[#8dbbf6] before:content-['✓']">Хранение истории за 12 месяцев</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-[#8dbbf6] before:content-['✓']">SMS при отсутствии интернета</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-[#8dbbf6] before:content-['✓']">До 5 объектов мониторинга</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-[#8dbbf6] before:content-['✓']">Приоритетная поддержка</li>
            </ul>
          </div>
          <a href="#lead-form" class="mt-10 inline-flex min-h-13 items-center justify-center rounded-full bg-white px-6 font-semibold text-moonless-night transition hover:-translate-y-0.5">Выбрать тариф</a>
        </article>

        <!-- Корпоративный -->
        <article class="flex min-h-[570px] flex-col justify-between rounded-[26px] border border-moonless-night/10 bg-white/40 p-7 sm:p-9">
          <div>
            <p class="mb-3 text-sm text-moonless-night/50">Для распределённых систем</p>
            <h3 class="text-3xl font-bold">Корпоративный</h3>
            <div class="my-8 min-h-[70px]">
              <span class="text-4xl font-bold tracking-[-0.04em]">По запросу</span>
            </div>
            <ul class="space-y-4">
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">Неограниченное количество объектов</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">Персональные роли и права доступа</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">Интеграция через API</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">Настраиваемый срок хранения данных</li>
              <li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">Индивидуальные условия поддержки</li>
            </ul>
          </div>
          <a href="#lead-form" class="mt-10 inline-flex min-h-13 items-center justify-center rounded-full border border-moonless-night/15 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-moonless-night">Обсудить проект</a>
        </article>
      </div>
      <p class="mt-6 text-center text-sm text-moonless-night/50">Стоимость оборудования рассчитывается отдельно.</p>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="py-20 md:py-28 lg:py-32">
    <div class="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[0.65fr_1fr] lg:gap-20 lg:px-8">
      <header class="max-w-md md:sticky md:top-10 md:self-start">
        <p class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-electric-blue">Частые вопросы</p>
        <h2 class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl">FAQ</h2>
        <p class="mt-5 text-base leading-7 text-moonless-night/50 md:text-lg">Основное о подключении, уведомлениях и работе оборудования.</p>
        <a href="#lead-form" class="group mt-7 inline-flex items-center gap-2 font-semibold text-electric-blue">Задать свой вопрос<span class="transition-transform group-hover:translate-x-1">→</span></a>
      </header>

      <div class="border-t border-moonless-night/10">
        <details class="group border-b border-moonless-night/10" open>
          <summary class="relative flex min-h-24 cursor-pointer list-none items-center pr-14 text-lg font-semibold marker:hidden sm:text-xl">
            Что произойдёт, если на объекте пропадёт интернет?
            <span class="absolute right-1 h-8 w-8 rounded-full border border-moonless-night/15 before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-moonless-night after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-moonless-night after:transition-transform group-open:after:rotate-90"></span>
          </summary>
          <div class="max-w-2xl pb-7 pr-4 leading-7 text-moonless-night/50">Шлюз продолжит фиксировать показания локально. Если значение станет критическим, система отправит SMS через резервный GSM-канал. После восстановления соединения данные синхронизируются с облаком.</div>
        </details>
        <details class="group border-b border-moonless-night/10">
          <summary class="relative flex min-h-24 cursor-pointer list-none items-center pr-14 text-lg font-semibold marker:hidden sm:text-xl">
            Сколько времени занимает установка?
            <span class="absolute right-1 h-8 w-8 rounded-full border border-moonless-night/15 before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-moonless-night after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-moonless-night after:transition-transform group-open:after:rotate-90"></span>
          </summary>
          <div class="max-w-2xl pb-7 pr-4 leading-7 text-moonless-night/50">Типовое подключение одного объекта занимает от 30 минут. Датчики устанавливаются в нужных зонах, подключаются к шлюзу и появляются в личном кабинете.</div>
        </details>
        <details class="group border-b border-moonless-night/10">
          <summary class="relative flex min-h-24 cursor-pointer list-none items-center pr-14 text-lg font-semibold marker:hidden sm:text-xl">
            Можно ли подключить несколько объектов?
            <span class="absolute right-1 h-8 w-8 rounded-full border border-moonless-night/15 before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-moonless-night after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-moonless-night after:transition-transform group-open:after:rotate-90"></span>
          </summary>
          <div class="max-w-2xl pb-7 pr-4 leading-7 text-moonless-night/50">Да. В одном аккаунте можно объединить магазины, склады, холодильные камеры и производственные площадки, а затем назначить ответственных сотрудников для каждого объекта.</div>
        </details>
        <details class="group border-b border-moonless-night/10">
          <summary class="relative flex min-h-24 cursor-pointer list-none items-center pr-14 text-lg font-semibold marker:hidden sm:text-xl">
            Какие уведомления поддерживаются?
            <span class="absolute right-1 h-8 w-8 rounded-full border border-moonless-night/15 before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-moonless-night after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-moonless-night after:transition-transform group-open:after:rotate-90"></span>
          </summary>
          <div class="max-w-2xl pb-7 pr-4 leading-7 text-moonless-night/50">Доступны уведомления по email, в Telegram и по SMS. Для каждого датчика можно настроить собственные пороговые значения и список получателей.</div>
        </details>
        <details class="group border-b border-moonless-night/10">
          <summary class="relative flex min-h-24 cursor-pointer list-none items-center pr-14 text-lg font-semibold marker:hidden sm:text-xl">
            Можно ли выгружать данные для отчётности?
            <span class="absolute right-1 h-8 w-8 rounded-full border border-moonless-night/15 before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-moonless-night after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-moonless-night after:transition-transform group-open:after:rotate-90"></span>
          </summary>
          <div class="max-w-2xl pb-7 pr-4 leading-7 text-moonless-night/50">Показания можно просматривать в личном кабинете и выгружать в виде таблиц. Для корпоративных интеграций предусмотрен API.</div>
        </details>
      </div>
    </div>
  </section>
</template>
