# Примеры ответов API (Этап 1)

Проверено 27.10.2026 с компьютера в Таджикистане. По этим файлам пишутся `lib/normalizeJob.js` и `lib/rates.js`.

| Файл | Запрос |
| --- | --- |
| `trudvsem-search.json` | `GET https://opendata.trudvsem.ru/api/v1/vacancies?text=разнорабочий&limit=3` |
| `trudvsem-region-housing.json` | `GET .../vacancies/region/7700000000000?accommodation=true&limit=5` (Москва + жильё) |
| `trudvsem-vacancy.json` | `GET .../vacancies/vacancy/{companycode}/{id}` (одна вакансия) |
| `cbr-daily.xml` | `GET https://www.cbr.ru/scripts/XML_daily.asp` (перекодирован в UTF-8) |
| `nbt-daily.xml` | `GET https://nbt.tj/ru/kurs/export_xml.php?date=2026-10-27&export=xmlout` |

## «Работа России» (trudvsem)

- Ключ не нужен. **Каждый запрос идёт 11–18 секунд**, поэтому таймаут 10 с из PRD не подходит: ставим ~25 с и полагаемся на кэш.
- При 8 параллельных запросах API перестал принимать соединения (`UND_ERR_CONNECT_TIMEOUT`). Запросы — по одному, без лишних повторов.
- Всего вакансий: 502 162.
- Работают: `text`, `limit`, `offset`, `accommodation=true` (13 486 вакансий с жильём), путь `/region/{код}`. Сочетаются: `text=грузчик&accommodation=true` → 58.
- **Не работают** (total не меняется): `salary_min`, `salary`, `salaryMin`, `salary_from`, `minSalary`, `workPlaceForeign`, `foreign`. Фильтр «зарплата от» (V-5) придётся делать на нашей стороне.
- Код региона — 13 цифр: Москва `7700000000000`, Самарская обл. `6300000000000`. Эндпоинт списка регионов `/api/v1/regions` отдаёт 404 — коды берём из ответов и записываем в `data/regions.json` сами.
- **Признака жилья в теле вакансии нет**, он есть только как фильтр. Поэтому `housing: true` ставим, только если вакансия пришла по запросу с `accommodation=true`, иначе `null` (неизвестно).
- Полезное поле `workPlaceType.workPlaceForeign: true` — рабочее место для иностранцев. Фильтра по нему нет, но можно показывать метку.
- Зарплата: `salary_min`, `salary_max` (числа), `salary` (строка «от 27093»), валюта `currency: "«руб.»"`.
- Ссылка на оригинал: `vac_url`. Дата: `creation-date`, `date_modify`.
- Текст вакансии местами в `duty`, `requirements`, `term.text` (условия, бывает служебный мусор вроде `MONTHLY 10000`).

## Курс ₽ → сомони

- **Нацбанк Таджикистана** (основной источник): `RUB`, `Nominal 1`, `Value 0.1144` → 1 ₽ = 0,1144 сомони. В XML заголовок `windows-1251`, но тело на самом деле в UTF-8. Отвечает за ~1 с.
- **ЦБ РФ** (запасной): `TJS`, `Nominal 10`, `Value 87,3790` (запятая!) → 1 сомони = 8,7379 ₽. Кодировка windows-1251.

## Aviasales (Travelpayouts)

- Без токена: `401`. Нужен токен в `.env.local` → `TRAVELPAYOUTS_TOKEN`, потом сохранить пример `aviasales-dyu-mow.json`.
