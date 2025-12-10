/**
 * ========================================
 * 카드 관련 API 라우트
 * ========================================
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// 사용자의 보유 카드 조회
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await db.query(
      'SELECT card_data FROM purchased_cards WHERE user_id = $1',
      [userId]
    );
    
    const cards = result.rows.map(row => row.card_data);
    res.json(cards);
  } catch (error) {
    console.error('[API] 카드 조회 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 카드 추가 (구매)
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { cardId, cardData } = req.body;
    
    await db.query(
      `INSERT INTO purchased_cards (user_id, card_id, card_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, card_id) DO UPDATE SET card_data = EXCLUDED.card_data`,
      [userId, cardId, JSON.stringify(cardData)]
    );
    
    res.status(201).json({ message: '카드 추가 완료' });
  } catch (error) {
    console.error('[API] 카드 추가 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 덱 저장
router.put('/:userId/deck', async (req, res) => {
  try {
    const { userId } = req.params;
    const { cardIds, deckName = 'default' } = req.body;
    
    await db.query(
      `INSERT INTO user_decks (user_id, deck_name, card_ids, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, deck_name) DO UPDATE SET
       card_ids = EXCLUDED.card_ids,
       updated_at = NOW()`,
      [userId, deckName, cardIds]
    );
    
    res.json({ message: '덱 저장 완료' });
  } catch (error) {
    console.error('[API] 덱 저장 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 덱 조회
router.get('/:userId/deck', async (req, res) => {
  try {
    const { userId } = req.params;
    const { deckName = 'default' } = req.query;
    
    const result = await db.query(
      'SELECT card_ids FROM user_decks WHERE user_id = $1 AND deck_name = $2',
      [userId, deckName]
    );
    
    if (result.rows.length === 0) {
      return res.json({ cardIds: [] });
    }
    
    res.json({ cardIds: result.rows[0].card_ids || [] });
  } catch (error) {
    console.error('[API] 덱 조회 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

module.exports = router;

