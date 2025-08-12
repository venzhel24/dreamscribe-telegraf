# Переменные окружения
COMPOSE := docker compose
PROJECT_DIR := $(shell pwd)
ENV_FILE := .env

# Основные цели
.PHONY: up-dev down-dev shell start-dev test npm-install clean clean-all

# Запуск окружения (сеть, БД, Redis, приложение)
up-dev: down-dev
	@echo "Создаём сеть при необходимости..."
	@if ! docker network inspect dreamscribe-network >/dev/null 2>&1; then \
		docker network create dreamscribe-network; \
	fi
	@echo "Запускаем сервисы в docker compose..."
	$(COMPOSE) up -d
	@echo "Выполняем npm run start:dev..."
	npm run start:dev

# Остановка окружения
down-dev:
	@echo "Останавливаем сервисы..."
	$(COMPOSE) down

# Запуск npm start:dev в контейнере
start-dev:
	$(COMPOSE) exec app npm run start:dev

# Вход в shell контейнера
shell:
	$(COMPOSE) exec app sh

# Запуск тестов
test:
	$(COMPOSE) exec app npm test

# npm install в контейнере
npm-install:
	$(COMPOSE) exec app npm install

# Удаление только данных (томы)
clean:
	@docker volume prune -f
	@echo "Docker volumes удалены."

# Уничтожающий everything: остановка, удаление сети, томов и images
clean-all: down-dev
	@if docker network inspect dreamscribe-network >/dev/null 2>&1; then \
		docker network rm dreamscribe-network; \
	fi
	@echo "Удаляем Docker images и volumes..."
	@docker system prune -a -f
	@echo "Окружение полностью очищено."
