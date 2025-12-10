/**
 * ========================================
 * PvP 통계 관련 API 라우트
 * ========================================
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// PvP 통계 조회
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [statsResult, weeklyResult] = await Promise.all([
      db.query('SELECT * FROM pvp_stats WHERE user_id = $1', [userId]),
      db.query('SELECT * FROM weekly_records WHERE user_id = $1 ORDER BY week DESC LIMIT 4', [userId])
    ]);
    
    if (statsResult.rows.length === 0) {
      return res.json({
        wins: 0,
        losses: 0,
        totalGames: 0,
        winRate: 0,
        weeklyRecords: []
      });
    }
    
    const stats = statsResult.rows[0];
    const statsData = {
      wins: stats.wins,
      losses: stats.losses,
      totalGames: stats.total_games,
      winRate: Number(stats.win_rate),
      weeklyRecords: weeklyResult.rows.map(row => ({
        week: row.week,
        wins: row.wins,
        losses: row.losses,
        winRate: Number(row.win_rate)
      })),
      lastUpdated: stats.last_updated
    };
    
    res.json(statsData);
  } catch (error) {
    console.error('[API] PvP 통계 조회 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// PvP 통계 업데이트
router.put('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { won, week } = req.body;
    
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 전체 통계 업데이트
      const statsResult = await client.query(
        `INSERT INTO pvp_stats (user_id, wins, losses, total_games, win_rate, last_updated)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
         wins = pvp_stats.wins + EXCLUDED.wins,
         losses = pvp_stats.losses + EXCLUDED.losses,
         total_games = pvp_stats.total_games + 1,
         win_rate = CASE 
           WHEN (pvp_stats.total_games + 1) > 0 
           THEN (pvp_stats.wins + EXCLUDED.wins)::DECIMAL / (pvp_stats.total_games + 1)::DECIMAL
           ELSE 0 
         END,
         last_updated = NOW()
         RETURNING *`,
        [userId, won ? 1 : 0, won ? 0 : 1, 1, won ? 1.0 : 0.0]
      );
      
      // 주간 통계 업데이트
      if (week) {
        await client.query(
          `INSERT INTO weekly_records (user_id, week, wins, losses, win_rate, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (user_id, week) DO UPDATE SET
           wins = weekly_records.wins + EXCLUDED.wins,
           losses = weekly_records.losses + EXCLUDED.losses,
           win_rate = CASE
             WHEN (weekly_records.wins + weekly_records.losses + 1) > 0
             THEN (weekly_records.wins + EXCLUDED.wins)::DECIMAL / (weekly_records.wins + weekly_records.losses + 1)::DECIMAL
             ELSE 0
           END,
           updated_at = NOW()`,
          [userId, week, won ? 1 : 0, won ? 0 : 1, won ? 1.0 : 0.0]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({ message: '통계 업데이트 완료' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[API] PvP 통계 업데이트 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 랭킹 조회
router.get('/ranking', async (req, res) => {
  try {
    const { week } = req.query;
    
    if (!week) {
      return res.status(400).json({ error: 'week 파라미터가 필요합니다.' });
    }
    
    const result = await db.query(
      `SELECT 
        u.id,
        u.name,
        wr.wins,
        wr.losses,
        wr.win_rate,
        (wr.wins + wr.losses) as total_games
       FROM weekly_records wr
       JOIN users u ON u.id = wr.user_id
       WHERE wr.week = $1 AND (wr.wins + wr.losses) >= 1
       ORDER BY wr.win_rate DESC, total_games DESC
       LIMIT 3`,
      [week]
    );
    
    const ranking = result.rows.map(row => ({
      userId: row.id,
      userName: row.name,
      wins: row.wins,
      losses: row.losses,
      winRate: Number(row.win_rate),
      totalGames: Number(row.total_games)
    }));
    
    res.json(ranking);
  } catch (error) {
    console.error('[API] 랭킹 조회 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

module.exports = router;

