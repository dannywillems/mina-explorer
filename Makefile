UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    SED := $(shell command -v gsed 2>/dev/null)
    ifeq ($(SED),)
        $(error GNU sed (gsed) not found on macOS. \
			Install with: brew install gnu-sed)
    endif
else
    SED := sed
endif

.PHONY: help
help: ## Ask for help!
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; \
		{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: setup
setup: ## Install dependencies
	npm install

.PHONY: dev
dev: ## Start development server
	npx vite

.PHONY: build
build: ## Build for production
	npx vite build

.PHONY: preview
preview: ## Preview production build
	npx vite preview

.PHONY: typecheck
typecheck: ## Run TypeScript type checker
	npx tsc --noEmit

.PHONY: lint
lint: ## Run ESLint
	npx eslint src/

.PHONY: format
format: ## Format code with Prettier
	npx prettier --write "src/**/*.{ts,tsx,scss}"

.PHONY: check-format
check-format: ## Check code formatting
	npx prettier --check "src/**/*.{ts,tsx,scss}"

.PHONY: sass
sass: ## Compile SASS to CSS
	npx sass src/scss/style.scss css/style.css

.PHONY: sass-watch
sass-watch: ## Watch SASS files and compile on change
	npx sass --watch src/scss/style.scss css/style.css

.PHONY: clean
clean: ## Clean build artifacts
	rm -rf dist node_modules css/style.css css/style.css.map

.PHONY: test-e2e
test-e2e: ## Run e2e tests (requires dev server running)
	npx playwright test

.PHONY: test-e2e-ui
test-e2e-ui: ## Run e2e tests with UI
	npx playwright test --ui

.PHONY: fix-trailing-whitespace
fix-trailing-whitespace: ## Remove trailing whitespaces from all files
	@echo "Removing trailing whitespaces from all files..."
	@find . -type f \( \
		-name "*.rs" -o -name "*.toml" -o -name "*.md" -o -name "*.yaml" \
		-o -name "*.yml" -o -name "*.ts" -o -name "*.tsx" \
		-o -name "*.js" -o -name "*.jsx" -o -name "*.sh" \
		-o -name "*.py" -o -name "*.go" -o -name "*.c" -o -name "*.h" \
		-o -name "*.cpp" -o -name "*.hpp" -o -name "*.json" \
		-o -name "*.scss" \) \
		-not -path "./node_modules/*" \
		-not -path "./dist/*" \
		-not -path "./.git/*" \
		-exec sh -c \
			'echo "Processing: $$1"; $(SED) -i -e "s/[[:space:]]*$$//" "$$1"' \
			_ {} \; && \
		echo "Trailing whitespaces removed."

.PHONY: check-trailing-whitespace
check-trailing-whitespace: ## Check for trailing whitespaces in source files
	@echo "Checking for trailing whitespaces..."
	@files_with_trailing_ws=$$(find . -type f \( \
		-name "*.rs" -o -name "*.toml" -o -name "*.md" -o -name "*.yaml" \
		-o -name "*.yml" -o -name "*.ts" -o -name "*.tsx" \
		-o -name "*.js" -o -name "*.jsx" -o -name "*.sh" \
		-o -name "*.py" -o -name "*.go" -o -name "*.c" -o -name "*.h" \
		-o -name "*.cpp" -o -name "*.hpp" -o -name "*.json" \
		-o -name "*.scss" \) \
		-not -path "./node_modules/*" \
		-not -path "./dist/*" \
		-not -path "./.git/*" \
		-exec grep -l '[[:space:]]$$' {} + 2>/dev/null || true); \
	if [ -n "$$files_with_trailing_ws" ]; then \
		echo "Files with trailing whitespaces found:"; \
		echo "$$files_with_trailing_ws" | sed 's/^/  /'; \
		echo ""; \
		echo "Run 'make fix-trailing-whitespace' to fix automatically."; \
		exit 1; \
	else \
		echo "No trailing whitespaces found."; \
	fi
