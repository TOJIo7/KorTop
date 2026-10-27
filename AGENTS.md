<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Правила проекта KorTop

Проект: сайт вакансий для трудовых мигрантов из Таджикистана в Россию.
План и структура папок: ROADMAP.md. Требования: PRD.md. Не отходи от них без моего согласия.

Стек: Next.js 16 (App Router, Cache Components), JavaScript (не TypeScript), Tailwind CSS 4, next-intl, lucide-react.

Правила:
- Делай только ту задачу, которую я дал. Не трогай другие файлы без причины.
- Перед изменениями коротко напиши план: какие файлы создашь или изменишь.
- Страницы — серверные компоненты. "use client" только для интерактивных частей.
- Внешние API вызываются только из lib/. Токены только из process.env.
- Кэш данных: `'use cache'` + `cacheLife(...)` в функциях lib/ (включены Cache Components), а не `fetch(..., { next: { revalidate } })`.
- Никаких выдуманных данных: вакансии, цены, курсы только из API или из data/ с полями source и checkedAt.
- Все тексты интерфейса через next-intl (messages/tg.json и messages/ru.json), без текста прямо в JSX.
- Mobile-first: сначала вёрстка для 360 px.
- Обрабатывай загрузку, ошибку и пустой результат.
- Простой и понятный код, короткие комментарии на русском там, где логика неочевидна.
- После изменений скажи, как проверить, что всё работает.
