# Regenerate versioned data for the Alfred APEX workflow.
#
#   make doc [VERSION=26.1] [OUT=data/doc.json]
#   make synonyms [FROM=24.2] [TO=26.1]
#   make all [VERSION=26.1] [FROM=24.2]
#   make test
#
# DB-sourced files (views, icons, data generator domains) can only be
# refreshed against an APEX database of the matching version:
#   make db-views / make db-icons / make db-dg-domains
# These expect SQLcl (`sql`) on PATH and either a saved connection name
# or a connect string, e.g.
#   make db-views CONN="-name local-23ai-advent"
#   make db-views CONN="user/pass@//host:1521/xepdb1"

VERSION ?= 26.1
FROM ?= 24.2
OUT ?= data/doc.json
SYNONYMS_FILE ?= data/synonyms.json
CONN ?=

.PHONY: help doc synonyms normalize check-substitutions all test validate db-views db-icons db-dg-domains

help:
	@echo "Targets:"
	@echo "  make doc [VERSION=26.1] [OUT=data/doc.json]  Rebuild doc.json from docs.oracle.com (no DB needed)"
	@echo "  make synonyms [FROM=24.2] [TO=26.1]           Rewrite versioned doc URLs in synonyms.json"
	@echo "  make normalize [FILES='data/views.json ...']  Sort + pretty-print JSON data files (default: all generated)"
	@echo "  make check-substitutions [VERSION=26.1]       Diff substitutions.json against the 26.1 docs page"
	@echo "  make all [VERSION=26.1] [FROM=24.2]           doc + synonyms + test"
	@echo "  make test                                     Run ava test suite"
	@echo "  make validate                                 Syntax-check scripts + run tests"
	@echo "  make db-views [CONN='-name myconn']            Refresh views.json via data/views.sql (needs SQLcl + APEX DB)"
	@echo "  make db-icons [CONN='-name myconn']            Refresh icons.json via data/icons.sql (needs SQLcl + APEX DB)"
	@echo "  make db-dg-domains [CONN='-name myconn']       Refresh data_generator_domains.json (needs SQLcl + APEX DB)"

doc:
	node scripts/generate-doc.mjs --version=$(VERSION) --out=$(OUT)

synonyms:
	node scripts/migrate-synonyms.mjs --from=$(FROM) --to=$(VERSION) --file=$(SYNONYMS_FILE)

# Sort + pretty-print generated JSON so regeneration is diffable.
# Default covers all generated files; override with FILES="data/views.json ...".
FILES ?=
normalize:
	node scripts/normalize-data.mjs $(if $(FILES),$(FILES),--all)

check-substitutions:
	node scripts/check-substitutions.mjs --version=$(VERSION)

all: doc synonyms test

test:
	npm test

validate:
	node --check scripts/generate-doc.mjs
	node --check scripts/migrate-synonyms.mjs
	node --check scripts/normalize-data.mjs
	node --check scripts/check-substitutions.mjs
	npm test

# --- DB-sourced refresh (requires SQLcl + APEX $(VERSION) database) ---
# NOTE: scripts must run with data/ as working directory so SPOOL writes
# land in data/. A positional @script arg cannot be combined with -name,
# hence the -e "@<script>" form.

db-views:
	@if [ -z "$(CONN)" ]; then echo 'Missing CONN. Examples:'; echo '  make db-views CONN="-name local-23ai-advent"'; echo '  make db-views CONN="user/pass@//host:1521/xepdb1"'; exit 1; fi
	@if ! command -v sql >/dev/null 2>&1; then echo 'SQLcl (`sql`) not found on PATH.'; exit 1; fi
	cd data && sql -S $(CONN) -e "@views.sql" && node ../scripts/normalize-data.mjs views.json

db-icons:
	@if [ -z "$(CONN)" ]; then echo 'Missing CONN. Examples:'; echo '  make db-icons CONN="-name local-23ai-advent"'; echo '  make db-icons CONN="user/pass@//host:1521/xepdb1"'; exit 1; fi
	@if ! command -v sql >/dev/null 2>&1; then echo 'SQLcl (`sql`) not found on PATH.'; exit 1; fi
	cd data && sql -S $(CONN) -e "@icons.sql" && node ../scripts/normalize-data.mjs icons.json

db-dg-domains:
	@if [ -z "$(CONN)" ]; then echo 'Missing CONN. Examples:'; echo '  make db-dg-domains CONN="-name local-23ai-advent"'; echo '  make db-dg-domains CONN="user/pass@//host:1521/xepdb1"'; exit 1; fi
	@if ! command -v sql >/dev/null 2>&1; then echo 'SQLcl (`sql`) not found on PATH.'; exit 1; fi
	cd data && sql -S $(CONN) -e "@data_generator_domains.sql" && node ../scripts/normalize-data.mjs data_generator_domains.json
