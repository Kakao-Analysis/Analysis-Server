# MySQL 설정 가이드

## 방법 1: Docker 사용 (권장)

### 1. Docker 설치 확인
```bash
docker --version
docker-compose --version
```

Docker가 설치되어 있지 않다면 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)을 설치하세요.

### 2. MySQL 컨테이너 실행
```bash
cd Analysis-Server
docker-compose up -d
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가:
```env
DATABASE_URL="mysql://app_user:app_password@localhost:3306/kakao_analysis"
```

### 4. Prisma 마이그레이션 실행
```bash
npx prisma migrate dev --name init_mysql
```

또는 기존 마이그레이션을 MySQL에 적용:
```bash
npx prisma migrate deploy
```

### 5. Prisma Client 재생성
```bash
npx prisma generate
```

### 6. 컨테이너 관리
```bash
# 컨테이너 중지
docker-compose down

# 컨테이너 중지 및 데이터 삭제
docker-compose down -v

# 컨테이너 로그 확인
docker-compose logs mysql

# 컨테이너 상태 확인
docker-compose ps
```

## 방법 2: 클라우드 MySQL 서비스 사용

### 옵션 A: PlanetScale (무료 티어 제공)
1. [PlanetScale](https://planetscale.com) 가입
2. 데이터베이스 생성
3. 연결 문자열 복사
4. `.env` 파일에 추가:
```env
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"
```

### 옵션 B: Supabase (PostgreSQL이지만 MySQL도 지원)
1. [Supabase](https://supabase.com) 가입
2. 프로젝트 생성
3. 연결 정보 확인

### 옵션 C: Railway, Render 등
- Railway, Render 등의 PaaS 서비스에서 MySQL 제공
- 각 서비스의 문서를 참고하여 설정

## 방법 3: 로컬 MySQL 설치 (선택사항)

Homebrew를 사용한 설치:
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

## 데이터베이스 연결 확인

```bash
# Docker MySQL에 직접 연결
docker exec -it kakao-analysis-mysql mysql -u app_user -p
# 비밀번호: app_password

# 또는
mysql -h localhost -u app_user -p kakao_analysis
```

## 주의사항

1. **기존 SQLite 데이터 마이그레이션**
   - SQLite에서 MySQL로 데이터를 옮기려면 별도 스크립트 필요
   - 또는 처음부터 MySQL로 시작하는 것을 권장

2. **환경 변수**
   - `.env` 파일은 `.gitignore`에 포함되어 있어야 함
   - 프로덕션에서는 환경 변수 관리 시스템 사용

3. **포트 충돌**
   - 로컬에 이미 MySQL이 실행 중이면 포트 3306이 충돌할 수 있음
   - `docker-compose.yml`에서 포트를 변경 가능 (예: "3307:3306")

4. **데이터 백업**
   - Docker 볼륨에 데이터가 저장되므로 `docker-compose down -v` 실행 시 데이터가 삭제됨
   - 정기적인 백업 권장

## 트러블슈팅

### MySQL 컨테이너가 시작되지 않을 때
```bash
docker-compose logs mysql
```

### 연결 오류가 발생할 때
- MySQL 컨테이너가 실행 중인지 확인: `docker-compose ps`
- 포트가 사용 중인지 확인: `lsof -i :3306`
- 환경 변수 `DATABASE_URL`이 올바른지 확인

### Prisma 마이그레이션 오류
```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 리셋 (주의: 데이터 삭제됨)
npx prisma migrate reset
```




