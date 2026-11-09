/**
 * API-клиент для общения с Express-сервером.
 */

const BASE = '/api';

/**
 * Получает OHLCV-свечи с бэкенда.
 *
 * @param {string} symbol     — торговая пара, напр. 'UNI/USDT'
 * @param {string} timeframe  — '1h' | '4h' | '1d' | '1w'
 * @param {number} limit      — кол-во свечей (макс. 1000 у Binance)
 * @returns {Promise<number[][]>} — [[ts, o, h, l, c, v], …]
 */
export async function fetchOHLCV(symbol, timeframe = '1d', limit = 200) {
  const params = new URLSearchParams({ symbol, timeframe, limit: String(limit) });
  const res = await fetch(`${BASE}/ohlcv?${params}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Загружает список поддерживаемых монет.
 */
export async function fetchCoins() {
  const res = await fetch(`${BASE}/coins`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

