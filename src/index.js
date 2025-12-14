// src/index.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const analysesRouter = require('./routes/analyses');

const app = express();
app.use(express.json());

// 1) YAML 스펙 로드 (swagger/swagger.yaml 위치)
const swaggerDocument = YAML.load(
  path.join(__dirname, '..', 'swagger', 'swagger.yaml')
);

// 2) Swagger UI 라우트
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3) 실제 API 라우트
app.use('/api', analysesRouter);

// 4) 건강 체크용
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 5) 404 에러 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 6) 500 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
