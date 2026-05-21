SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: init
init: ## Сгенерировать .env с безопасными секретами (только если файла нет)
	@if [ -f .env ]; then \
		echo ".env уже существует, пропускаю"; \
	else \
		cp .env.example .env; \
		JWT=$$(python -c "import secrets; print(secrets.token_urlsafe(64))"); \
		FERNET=$$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"); \
		sed -i.bak "s|^JWT_SECRET_KEY=.*|JWT_SECRET_KEY=$$JWT|" .env && rm -f .env.bak; \
		sed -i.bak "s|^CREDENTIALS_ENCRYPTION_KEY=.*|CREDENTIALS_ENCRYPTION_KEY=$$FERNET|" .env && rm -f .env.bak; \
		echo "Создан .env с секретами"; \
	fi

.PHONY: up
up: ## Поднять весь стек локально
	docker compose up -d --build

.PHONY: down
down: ## Остановить стек
	docker compose down

.PHONY: logs
logs: ## Логи всех сервисов
	docker compose logs -f --tail=200

.PHONY: ps
ps: ## Статус сервисов
	docker compose ps

.PHONY: migrate
migrate: ## Накатить миграции
	docker compose exec api alembic upgrade head

.PHONY: makemigration
makemigration: ## Создать новую миграцию: make makemigration name=add_xxx
	docker compose exec api alembic revision --autogenerate -m "$(name)"

.PHONY: shell-api
shell-api: ## Войти в контейнер api
	docker compose exec api bash

.PHONY: shell-db
shell-db: ## Открыть psql
	docker compose exec postgres psql -U $${POSTGRES_USER:-statops} -d $${POSTGRES_DB:-statops}

.PHONY: test
test: ## Прогнать тесты бэка
	docker compose exec api pytest -v

.PHONY: lint-backend
lint-backend: ## Линтер бэка
	cd backend && ruff check app tests

.PHONY: lint-frontend
lint-frontend: ## Линтер фронта
	cd frontend && npm run lint

.PHONY: typecheck-frontend
typecheck-frontend: ## TS проверка
	cd frontend && npx tsc -b --noEmit

.PHONY: clean
clean: ## Снести контейнеры и тома (внимание — потеряете данные БД)
	docker compose down -v
