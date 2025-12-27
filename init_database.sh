#!/bin/bash

echo "MySQL 데이터베이스 초기화 중..."

MYSQL_USER="${MYSQL_USER:-app_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-app_password}"
MYSQL_DATABASE="${MYSQL_DATABASE:-kakao_analysis}"
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"

if [ -f "schema.sql" ]; then
  echo "schema.sql 파일을 실행합니다..."
  mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < schema.sql
  echo "완료!"
else
  echo "오류: schema.sql 파일을 찾을 수 없습니다."
  exit 1
fi




