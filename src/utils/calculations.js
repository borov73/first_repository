/**
 * Квантитативные расчёты для анализа крипторынка.
 *
 * Все функции — чистые, без побочных эффектов.
 */

// ─── Логарифмические доходности ──────────────────────────────────────────────

/**
 * Вычисляет ряд логарифмических доходностей.
 * r_t = ln(P_t / P_{t-1})
 *
 * @param {number[]} prices — временной ряд цен (close)
 * @returns {number[]} — массив длины (prices.length - 1)
 */
export function calculateLogReturns(prices) {
  const returns = new Array(prices.length - 1);
  for (let i = 1; i < prices.length; i++) {
    returns[i - 1] = Math.log(prices[i] / prices[i - 1]);
  }
  return returns;
}

// ─── Кросс-курс ─────────────────────────────────────────────────────────────

/**
 * Кросс-курс altcoin к ETH:  CR_t = P_alt_t / P_eth_t
 *
 * @param {number[]} altPrices  — цены закрытия альткоина (в USDT)
 * @param {number[]} ethPrices  — цены закрытия ETH (в USDT)
 * @returns {number[]}
 */
export function calculateCrossRate(altPrices, ethPrices) {
  if (altPrices.length !== ethPrices.length) {
    throw new RangeError('Price arrays must have equal length');
  }
  return altPrices.map((p, i) => p / ethPrices[i]);
}

// ─── Описательная статистика ─────────────────────────────────────────────────

/** Среднее арифметическое. */
export function mean(arr) {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}

/** Стандартное отклонение (population). */
export function std(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  let ss = 0;
  for (let i = 0; i < arr.length; i++) ss += (arr[i] - m) ** 2;
  return Math.sqrt(ss / arr.length);
}

/** Стандартное отклонение (sample, Bessel correction). */
export function stdSample(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  let ss = 0;
  for (let i = 0; i < arr.length; i++) ss += (arr[i] - m) ** 2;
  return Math.sqrt(ss / (arr.length - 1));
}

// ─── Корреляция и регрессия ──────────────────────────────────────────────────

/**
 * Коэффициент корреляции Пирсона.
 * @returns {number} ρ ∈ [-1, 1]
 */
export function pearsonCorrelation(x, y) {
  if (x.length !== y.length || x.length < 2) return 0;
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);

  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

/**
 * Линейная регрессия OLS: y = α + β·x
 *
 * @returns {{
 *   slope: number,        // β — чувствительность (beta к ETH)
 *   intercept: number,    // α — избыточная доходность (alpha)
 *   rSquared: number,     // R²
 *   correlation: number,  // ρ
 *   standardError: number,
 *   slopeSE: number,
 *   tStatistic: number,
 *   n: number,
 * }}
 */
export function linearRegression(x, y) {
  if (x.length !== y.length) throw new RangeError('Arrays must have same length');
  const n = x.length;
  if (n < 3) {
    return {
      slope: 0, intercept: 0, rSquared: 0, correlation: 0,
      standardError: 0, slopeSE: 0, tStatistic: 0, n,
    };
  }

  const mx = mean(x);
  const my = mean(y);

  let ssXY = 0, ssXX = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssYY += dy * dy;
  }

  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = my - slope * mx;
  const correlation = ssXX === 0 || ssYY === 0 ? 0 : ssXY / Math.sqrt(ssXX * ssYY);
  const rSquared = correlation * correlation;

  // Остатки → стандартная ошибка
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssRes += (y[i] - (slope * x[i] + intercept)) ** 2;
  }
  const standardError = Math.sqrt(ssRes / (n - 2));
  const slopeSE = ssXX === 0 ? 0 : standardError / Math.sqrt(ssXX);
  const tStatistic = slopeSE === 0 ? 0 : slope / slopeSE;

  return { slope, intercept, rSquared, correlation, standardError, slopeSE, tStatistic, n };
}

// ─── Риск-метрики ────────────────────────────────────────────────────────────

/**
 * Аннуализированная волатильность.
 * σ_ann = σ_period · √periodsPerYear
 */
export function annualizedVolatility(logReturns, periodsPerYear = 365) {
  return std(logReturns) * Math.sqrt(periodsPerYear);
}

/**
 * Аннуализированная доходность.
 * μ_ann = μ_period · periodsPerYear
 */
export function annualizedReturn(logReturns, periodsPerYear = 365) {
  return mean(logReturns) * periodsPerYear;
}

/**
 * Коэффициент Шарпа (risk-free = 0, типично для крипто).
 */
export function sharpeRatio(logReturns, periodsPerYear = 365) {
  const vol = annualizedVolatility(logReturns, periodsPerYear);
  return vol === 0 ? 0 : annualizedReturn(logReturns, periodsPerYear) / vol;
}

/**
 * Максимальная просадка (Maximum Drawdown) от пикового значения.
 * @returns {number} — значение в диапазоне [0, 1]
 */
export function maxDrawdown(prices) {
  let peak = prices[0];
  let mdd = 0;
  for (const p of prices) {
    if (p > peak) peak = p;
    const dd = (peak - p) / peak;
    if (dd > mdd) mdd = dd;
  }
  return mdd;
}

// ─── Выравнивание временных рядов ────────────────────────────────────────────

/**
 * Выравнивает два набора OHLCV-данных по timestamp.
 * Необходимо, поскольку разные торговые пары могут иметь пропуски.
 *
 * @param {number[][]} altOhlcv  — [[ts, o, h, l, c, v], …]
 * @param {number[][]} ethOhlcv  — [[ts, o, h, l, c, v], …]
 * @returns {{ timestamps: number[], altCandles: number[][], ethCandles: number[][] }}
 */
export function alignByTimestamp(altOhlcv, ethOhlcv) {
  const ethMap = new Map();
  for (const candle of ethOhlcv) {
    ethMap.set(candle[0], candle);
  }

  const timestamps = [];
  const altCandles = [];
  const ethCandles = [];

  for (const candle of altOhlcv) {
    const ethCandle = ethMap.get(candle[0]);
    if (ethCandle) {
      timestamps.push(candle[0]);
      altCandles.push(candle);
      ethCandles.push(ethCandle);
    }
  }

  return { timestamps, altCandles, ethCandles };
}

