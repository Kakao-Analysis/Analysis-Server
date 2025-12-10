// src/routes/analyses.js
const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /analyses:
 *   post:
 *     summary: 새 카카오톡 분석 요청 생성
 *     tags:
 *       - Analyses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "OOO와의 카톡 분석"
 *               periodStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-01T00:00:00Z"
 *               periodEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: 분석 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 status:
 *                   type: string
 *                   example: "CREATED"
 */
router.post('/', (req, res) => {
  const { title, periodStart, periodEnd } = req.body;

  console.log('새 분석 요청:', { title, periodStart, periodEnd });

  return res.status(201).json({
    id: 1,
    status: 'CREATED',
  });
});

/**
 * @openapi
 * /analyses/{id}:
 *   get:
 *     summary: 분석 요약 조회
 *     tags:
 *       - Analyses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 분석 ID
 *     responses:
 *       200:
 *         description: 분석 요약 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   example: "SUMMARY_READY"
 *                 isPaid:
 *                   type: boolean
 *                 emotionScore:
 *                   type: integer
 *                   example: 72
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  return res.json({
    id: Number(id),
    status: 'SUMMARY_READY',
    isPaid: false,
    emotionScore: 72,
  });
});

module.exports = router;
