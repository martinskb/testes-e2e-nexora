#!/usr/bin/env bash
# Sobe um MariaDB só para os testes E2E, dentro desta pasta (.mariadb/),
# na porta 3307. Não precisa de sudo e não mexe no banco do sistema.
set -euo pipefail
cd "$(dirname "$0")/.."
DIR="$PWD/.mariadb"
PORTA="${E2E_DB_PORT:-3307}"
if [ ! -d "$DIR/data/mysql" ]; then
  mkdir -p "$DIR/data"
  mariadb-install-db --no-defaults --datadir="$DIR/data" --auth-root-authentication-method=normal >/dev/null
fi
if ! mariadb-admin --no-defaults -h127.0.0.1 -P"$PORTA" -uroot ping >/dev/null 2>&1; then
  mariadbd --no-defaults --datadir="$DIR/data" --port="$PORTA" --bind-address=127.0.0.1 \
    --socket="$DIR/mysql.sock" --pid-file="$DIR/mariadb.pid" --log-error="$DIR/erro.log" &
  for _ in $(seq 1 30); do mariadb-admin --no-defaults -h127.0.0.1 -P"$PORTA" -uroot ping >/dev/null 2>&1 && break; sleep 0.5; done
fi
mariadb --no-defaults -h127.0.0.1 -P"$PORTA" -uroot <<SQL
CREATE DATABASE IF NOT EXISTS nexora_e2e CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'nexora'@'127.0.0.1' IDENTIFIED BY 'e2e';
GRANT ALL PRIVILEGES ON nexora_e2e.* TO 'nexora'@'127.0.0.1';
SQL
echo "MariaDB de teste pronto na porta $PORTA"
