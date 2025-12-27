require("dotenv").config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const apiRouter = require('./routes');

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:1223',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// 1) YAML 스펙 로드 (swagger/swagger.yaml 위치)
const swaggerDocument = YAML.load(
  path.join(__dirname, '..', 'swagger', 'swagger.yaml')
);

// 2) Swagger UI 라우트
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3) 실제 API 라우트
app.use('/api', apiRouter);

// 4) 서버 상태 체크용

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
