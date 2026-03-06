# ── Stage 1: dependências ────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

RUN pip install --no-cache-dir "poetry==1.8.*"

COPY pyproject.toml poetry.lock* ./

RUN poetry config virtualenvs.in-project true \
    && poetry install --only main --no-root --no-interaction --no-ansi

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# usuário sem privilégios
RUN useradd --no-create-home --shell /bin/false appuser

# copia apenas o venv e o código
COPY --from=builder /app/.venv /app/.venv
COPY src/            ./src/
COPY alembic/        ./alembic/
COPY alembic.ini     ./
COPY entrypoint.sh   ./

RUN mkdir -p data && chown -R appuser:appuser /app

USER appuser

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app/src"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
