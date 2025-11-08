.PHONY: help build run test clean migrate-up migrate-down docker-build docker-up docker-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the API server
	go build -o bin/api cmd/api/main.go

build-worker: ## Build the worker service
	go build -o bin/worker cmd/worker/main.go

run: ## Run the API server
	go run cmd/api/main.go

run-worker: ## Run the worker service
	go run cmd/worker/main.go

test: ## Run tests
	go test -v ./...

test-coverage: ## Run tests with coverage
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

clean: ## Clean build artifacts
	rm -rf bin/
	rm -f coverage.out

migrate-up: ## Run database migrations up
	go run cmd/migrate/main.go up

migrate-down: ## Run database migrations down
	go run cmd/migrate/main.go down

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all services
	docker-compose down

docker-logs: ## View logs from all services
	docker-compose logs -f

docker-clean: ## Remove all containers and volumes
	docker-compose down -v

dev: ## Run in development mode with hot reload
	air

lint: ## Run linter
	golangci-lint run

fmt: ## Format code
	go fmt ./...

deps: ## Download dependencies
	go mod download
	go mod tidy

.DEFAULT_GOAL := help
