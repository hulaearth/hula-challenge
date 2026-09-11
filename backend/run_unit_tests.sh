#!/bin/sh

set -e
uv sync --dev
uv run pytest tests