// src/index.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const analysesRouter = require('./routes/analyses');

const app = express();
app.use(express.json());

// Swagger 기본 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kakao Relationship Analysis API',
      version: '1.0.0',
      description: '카카오톡 대화 분석 서비스 백엔드 API 명세서',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local dev server',
      },
    ],
  },
  // Swagger가 주석을 읽어올 파일 경로
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI 라우트
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 실제 API 라우트
app.use('/analyses', analysesRouter);

// 건강 체크용
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
