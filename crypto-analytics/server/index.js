/**
 * Backend-сервер для получения рыночных данных с Binance через ccxt.
 *
 * Endpoints:
 *   GET /api/coins             — список поддерживаемых альткоинов
 *   GET /api/ohlcv?symbol=…&timeframe=…&limit=…  — OHLCV-свечи
 *
 * Кэш in-memory с TTL = 5 мин, чтобы не перегружать API.
 */

import express from 'express';
import cors from 'cors';
import ccxt from 'ccxt';

// ─── Exchange ────────────────────────────────────────────────────────────────

const exchange = new ccxt.binance({
  enableRateLimit: true,
  options: { defaultType: 'spot' },
});

// ─── Список альткоинов экосистемы Ethereum ───────────────────────────────────

const SUPPORTED_COINS = [
  { symbol: 'UNI',  name: 'Uniswap',   category: 'DEX',             pair: 'UNI/USDT'  },
  { symbol: 'LINK', name: 'Chainlink',  category: 'Oracle',          pair: 'LINK/USDT' },
  { symbol: 'AAVE', name: 'Aave',       category: 'DeFi Lending',    pair: 'AAVE/USDT' },
  { symbol: 'MKR',  name: 'Maker',      category: 'DeFi / CDP',      pair: 'MKR/USDT'  },
  { symbol: 'SNX',  name: 'Synthetix',  category: 'Derivatives',     pair: 'SNX/USDT'  },
  { symbol: 'COMP', name: 'Compound',   category: 'DeFi Lending',    pair: 'COMP/USDT' },
  { symbol: 'LDO',  name: 'Lido',       category: 'Liquid Staking',  pair: 'LDO/USDT'  },
  { symbol: 'ARB',  name: 'Arbitrum',   category: 'Layer 2',         pair: 'ARB/USDT'  },
  { symbol: 'OP',   name: 'Optimism',   category: 'Layer 2',         pair: 'OP/USDT'   },
  { symbol: 'ENS',  name: 'ENS',        category: 'Infrastructure',  pair: 'ENS/USDT'  },
];

// ─── In-memory Cache ─────────────────────────────────────────────────────────

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

function cacheKey(symbol, timeframe, limit) {
  return `${symbol}|${timeframe}|${limit}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ─── Express App ─────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// Список монет
app.get('/api/coins', (_req, res) => {
  res.json(SUPPORTED_COINS);
});

// OHLCV-данные
app.get('/api/ohlcv', async (req, res) => {
  try {
    const { symbol, timeframe = '1d', limit = '200' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Query parameter "symbol" is required (e.g. UNI/USDT)' });
    }

    const key = cacheKey(symbol, timeframe, limit);
    const cached = getCached(key);
    if (cached) return res.json(cached);

    console.log(`[ccxt] Fetching ${symbol} ${timeframe} limit=${limit}`);
    const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, parseInt(limit, 10));

    // ohlcv: [[timestamp, open, high, low, close, volume], …]
    setCache(key, ohlcv);
    res.json(ohlcv);
  } catch (err) {
    console.error('[ccxt] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅  API server listening on http://localhost:${PORT}`);
});

