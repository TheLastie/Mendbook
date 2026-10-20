# Mendbook

**A personal repair and ownership journal for the things you want to keep.** Track purchase details, warranty dates, serial numbers, maintenance costs and follow-up reminders in one place. Everything stays in your browser; export a JSON backup whenever you like.

![Mendbook desktop interface](screenshots/mendbook.png)
![Mendbook mobile interface](screenshots/mendbook-mobile.png)

## Run it

Open `index.html` in a modern browser, or serve this folder from a static web server. The service worker caches the app shell when it is served over HTTP(S), so the journal remains available offline after the first visit. Data is stored locally in this browser profile.

## What it does

- Keeps a searchable, filterable card for each item.
- Calculates warranty end dates from the purchase date and term.
- Records repairs, parts, costs and what to inspect next.
- Highlights upcoming service reminders and active warranties.
- Compares a repair quote with replacement cost per month of useful life, with assumptions shown.
- Prints an item card for a workshop drawer or paper folder.
- Exports and restores a portable JSON backup.

The sample cards are local demo data and can be deleted. The app has no accounts, analytics or server-side storage. Keep the backup somewhere safe if you clear browser data or change devices.

---

# Mendbook

**Личный журнал вещей и ремонта для того, что хочется сохранить.** Записывайте покупки, сроки гарантии, серийные номера, стоимость обслуживания и напоминания о следующей проверке. Данные остаются в браузере; в любой момент можно скачать резервную копию в JSON.

![Интерфейс Mendbook на компьютере](screenshots/mendbook.png)
![Интерфейс Mendbook на телефоне](screenshots/mendbook-mobile.png)

## Запуск

Откройте `index.html` в современном браузере или запустите папку через любой статический веб-сервер. При работе через HTTP(S) сервис-воркер кэширует файлы приложения, поэтому после первого посещения журнал открывается без сети. Записи хранятся локально в профиле этого браузера.

## Возможности

- Карточки вещей с поиском и фильтрами.
- Расчёт даты окончания гарантии.
- История ремонта, деталей, затрат и следующих проверок.
- Подсветка активных гарантий и скорых напоминаний.
- Сравнение ремонта и замены по стоимости месяца службы с показом допущений.
- Печать карточки для ящика мастерской или бумажной папки.
- Переносимая резервная копия JSON.

Стартовые карточки — демонстрационные, их можно удалить. Приложение не использует учётные записи, аналитику и серверное хранение. Сохраните резервную копию, если очищаете данные браузера или переходите на другое устройство.
