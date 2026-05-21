# statOps

Платформа аналитики для общепита. Объединяет данные из POS/CRM-систем
(iiko, Quick Resto, далее — другие), учёт расходов и финансовую отчётность
в единое представление по заведению.

## Цели проекта

- **Единая картина по заведению.** Выручка, себестоимость, расходы, прибыль —
  в одном месте, по любому периоду, с возможностью сравнить с прошлым.
- **Multi-tenant с первого дня.** Архитектура рассчитана на множество
  владельцев и множество заведений у одного владельца.
- **Расширяемость по источникам.** Добавление новой POS-системы — это
  написание одного коннектора, без изменения остальной системы.
- **Экспорт в Excel.** Любой отчёт можно выгрузить в `.xlsx`.

## Документы

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — архитектура, стек,
  модель данных, безопасность.
- [`docs/MVP_PLAN.md`](docs/MVP_PLAN.md) — план спринтов до релиза.
- [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) — заметки по
  iikoCloud, Quick Resto и другим источникам.

## Быстрый старт

Требования: Docker + Docker Compose, GNU Make, Python 3 (для генерации
секретов в `make init`).

```bash
# 1. Сгенерировать .env с безопасными секретами (один раз)
make init

# 2. Поднять весь стек
make up

# 3. Проверить, что всё запустилось
make ps
```

После запуска:

| Сервис | Адрес |
|---|---|
| Frontend (Refine UI) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| OpenAPI docs | http://localhost:8000/docs |
| Postgres | localhost:5432 (user `statops` / db `statops`) |

Откройте http://localhost:5173, зарегистрируйтесь и начинайте работу.

## Технический стек

| Слой | Технология |
|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic |
| База данных | PostgreSQL 16 |
| Очередь/кэш | Redis 7, Celery |
| Frontend | React 18 + TypeScript, Refine, Mantine 7 |
| Графики | Mantine Charts (планируется) |
| Excel | openpyxl (планируется) |
| Контейнеризация | Docker, docker-compose |

## Команды разработки

```bash
make up                # поднять стек
make down              # остановить
make logs              # логи всех сервисов
make migrate           # накатить миграции вручную
make makemigration name=add_table   # создать новую миграцию
make test              # тесты бэка
make lint-backend      # ruff
make typecheck-frontend  # tsc
make shell-api         # bash в контейнере api
make shell-db          # psql
make clean             # снести контейнеры И тома (потеряете данные)
```

## Структура репозитория

```
statops/
├── backend/        # FastAPI приложение
│   ├── app/
│   ├── alembic/
│   └── tests/
├── frontend/       # React + Refine + Mantine
│   └── src/
├── docs/           # ARCHITECTURE / MVP_PLAN / INTEGRATIONS
├── infra/          # инфра-конфиги (Caddy, скрипты)
├── docker-compose.yml
├── Makefile
└── README.md
```

## Текущий статус

**Спринт 1 (скелет) — в работе на ветке `claude/sprint-1-skeleton`.**

Дальнейший план — см. [`docs/MVP_PLAN.md`](docs/MVP_PLAN.md).

## Пилотное заведение

MVP тестируется на реальном ресторане владельца платформы — это даёт
быструю обратную связь по бизнес-смыслу отчётов, а не только по технике.
