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

// 4) 서버 상태 체크용

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
