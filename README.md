# KakaoTalk Analysis (MVP)

카카오톡 대화 내보내기(txt) 파일을 입력으로 받아  
관계 신호를 요약하고, 일부 분석 결과를 잠금 처리하는 **API 기반 MVP 프로젝트**입니다.

본 프로젝트는 **실제 서비스 운영이 아닌**
👉 API 설계  
👉 Swagger 문서화  
👉 협업 기준 수립  
을 목표로 합니다.

---

## What This Project Does

- 카카오톡 대화 텍스트 업로드
- 관계 분석 작업 생성
- 분석 결과 조회
  - 무료 프리뷰 제공
  - 상세 분석은 잠금 처리
- 잠금 해제 흐름은 플래그로 시뮬레이션
- Swagger UI에서 전체 API 테스트 가능

---

## MVP Scope

포함:
- 대화 텍스트 업로드
- 분석 생성 / 조회 API
- Free 영역 + Locked 영역 구조
- Swagger(OpenAPI) 기반 문서화

제외:
- 로그인 / 회원 관리
- 실제 결제 연동
- 관리자 페이지
- 운영 환경 배포

---

## Tech Stack

- Node.js / Express
- Swagger UI (OpenAPI 3.0)
- Prisma
- SQLite (local)

---

## Test Data (Dummy)

프로젝트에는 **카카오톡 대화 더미 파일**이 포함되어 있습니다.

- 파일 위치:  
  `Talk_2025.12.1 23:38-1.txt`
- 용도:
  - API 테스트용
  - 분석 결과 더미 생성 검증용
  - Swagger 시연용 데이터

해당 파일의 내용을 그대로 복사하여  
`POST /api/analyses` 요청의 `rawText` 필드에 사용합니다.

---

## Getting Started

```bash
npm install
npx prisma init --datasource-provider sqlite
##.env 파일 설정 DATABASE_URL="file:./dev.db"
npx prisma db pull
npx prisma generate
npm run dev
Swagger UI:
http://localhost:3000/api-docs
API Overview
POST /api/analyses
대화 텍스트 업로드 및 분석 생성
GET /api/analyses/{analysisId}
분석 결과 조회
unlock=true 시 잠금 해제 결과 반환
Notes
분석 로직은 MVP 단계에서 더미 데이터 기반으로 동작할 수 있습니다.
Swagger 명세를 API 계약의 기준으로 사용합니다.
본 프로젝트는 포트폴리오 및 학습 목적의 MVP입니다.