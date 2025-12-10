/**
 * ========================================
 * 사용자 관련 API 라우트
 * ========================================
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// 사용자 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 사용자 기본 정보
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    const user = userResult.rows[0];
    
    // 관련 데이터 조회
    const [bankProducts, transactions, purchasedCards, deck, pvpStats, weeklyRecords, shopProducts] = await Promise.all([
      db.query('SELECT * FROM bank_products WHERE user_id = $1 ORDER BY created_at', [id]),
      db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, time DESC LIMIT 500', [id]),
      db.query('SELECT card_data FROM purchased_cards WHERE user_id = $1', [id]),
      db.query('SELECT card_ids FROM user_decks WHERE user_id = $1 AND deck_name = $2', [id, 'default']),
      db.query('SELECT * FROM pvp_stats WHERE user_id = $1', [id]),
      db.query('SELECT * FROM weekly_records WHERE user_id = $1 ORDER BY week DESC LIMIT 4', [id]),
      db.query('SELECT product_id FROM purchased_shop_products WHERE user_id = $1', [id])
    ]);
    
    // 데이터 조합
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password, // 실제로는 제외해야 함
      registeredAt: user.registered_at,
      hasOpenBanking: user.has_open_banking,
      hasHiddenCard: user.has_hidden_card,
      hallOfFameRewards: user.hall_of_fame_rewards || [],
      bankProducts: bankProducts.rows.map(row => ({
        type: row.type,
        name: row.name,
        provider: row.provider,
        balance: row.balance ? Number(row.balance) : undefined,
        monthlyPayment: row.monthly_payment ? Number(row.monthly_payment) : undefined,
        cardLimit: row.card_limit ? Number(row.card_limit) : undefined,
        returnRate: row.return_rate ? Number(row.return_rate) : undefined
      })),
      transactions: transactions.rows.map(row => ({
        id: row.id,
        date: row.date,
        time: row.time,
        channel: row.channel,
        category: row.category,
        merchant: row.merchant,
        description: row.description,
        amount: Number(row.amount),
        balanceAfter: Number(row.balance_after)
      })),
      purchasedCards: purchasedCards.rows.map(row => row.card_data),
      selectedDeck: deck.rows.length > 0 ? deck.rows[0].card_ids : [],
      purchasedShopProducts: shopProducts.rows.map(row => row.product_id),
      pvpStats: pvpStats.rows.length > 0 ? {
        wins: pvpStats.rows[0].wins,
        losses: pvpStats.rows[0].losses,
        totalGames: pvpStats.rows[0].total_games,
        winRate: Number(pvpStats.rows[0].win_rate),
        weeklyRecords: weeklyRecords.rows.map(row => ({
          week: row.week,
          wins: row.wins,
          losses: row.losses,
          winRate: Number(row.win_rate)
        })),
        lastUpdated: pvpStats.rows[0].last_updated
      } : null
    };
    
    res.json(userProfile);
  } catch (error) {
    console.error('[API] 사용자 조회 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 사용자 생성
router.post('/', async (req, res) => {
  try {
    const { id, name, email, password, bankProducts, transactions } = req.body;
    
    // 트랜잭션 시작
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 사용자 생성
      await client.query(
        `INSERT INTO users (id, name, email, password, registered_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         updated_at = NOW()`,
        [id, name, email, password]
      );
      
      // 금융 상품 추가
      if (bankProducts && bankProducts.length > 0) {
        for (const product of bankProducts) {
          await client.query(
            `INSERT INTO bank_products (user_id, type, name, provider, balance, monthly_payment, card_limit, return_rate)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              id,
              product.type,
              product.name,
              product.provider,
              product.balance || null,
              product.monthlyPayment || null,
              product.cardLimit || null,
              product.returnRate || null
            ]
          );
        }
      }
      
      // 거래 내역 추가
      if (transactions && transactions.length > 0) {
        for (const tx of transactions) {
          await client.query(
            `INSERT INTO transactions (id, user_id, date, time, channel, category, merchant, description, amount, balance_after)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO NOTHING`,
            [
              tx.id,
              id,
              tx.date,
              tx.time,
              tx.channel,
              tx.category,
              tx.merchant,
              tx.description || null,
              tx.amount,
              tx.balanceAfter
            ]
          );
        }
      }
      
      // PvP 통계 초기화
      await client.query(
        `INSERT INTO pvp_stats (user_id, wins, losses, total_games, win_rate)
         VALUES ($1, 0, 0, 0, 0)
         ON CONFLICT (user_id) DO NOTHING`,
        [id]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({ message: '사용자 생성 완료', userId: id });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[API] 사용자 생성 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 사용자 정보 업데이트
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = [];
    const values = [];
    let paramIndex = 1;
    
    if (updates.hasOpenBanking !== undefined) {
      setClause.push(`has_open_banking = $${paramIndex++}`);
      values.push(updates.hasOpenBanking);
    }
    
    if (updates.hasHiddenCard !== undefined) {
      setClause.push(`has_hidden_card = $${paramIndex++}`);
      values.push(updates.hasHiddenCard);
    }
    
    if (updates.hallOfFameRewards !== undefined) {
      setClause.push(`hall_of_fame_rewards = $${paramIndex++}`);
      values.push(updates.hallOfFameRewards);
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: '업데이트할 항목이 없습니다.' });
    }
    
    setClause.push(`updated_at = NOW()`);
    values.push(id);
    
    await db.query(
      `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
    
    res.json({ message: '업데이트 완료' });
  } catch (error) {
    console.error('[API] 사용자 업데이트 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

module.exports = router;

