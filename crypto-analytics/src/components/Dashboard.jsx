import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { COINS, ETH_PAIR, TIMEFRAMES } from '../config/coins';
import { fetchOHLCV } from '../utils/api';
import {
  calculateLogReturns,
  calculateCrossRate,
  alignByTimestamp,
  linearRegression,
  annualizedVolatility,
  annualizedReturn,
  sharpeRatio,
  maxDrawdown,
} from '../utils/calculations';

import CoinSelector from './CoinSelector';
import StatsPanel from './StatsPanel';
import CandlestickChart from './CandlestickChart';
import LogReturnsChart from './LogReturnsChart';
import CrossRateChart from './CrossRateChart';
import CrossRateLogReturnsChart from './CrossRateLogReturnsChart';
import RegressionChart from './RegressionChart';

/**
 * Главный Dashboard — управляет состоянием, загружает данные,
 * вычисляет все метрики и передаёт их дочерним компонентам.
 */
export default function Dashboard() {
  // ─── State ───────────────────────────────────────────────────────────────────
  const [selectedSymbol, setSelectedSymbol] = useState(COINS[0].symbol);
  const [timeframe, setTimeframe] = useState('1d');
  const [altOhlcv, setAltOhlcv] = useState(null);
  const [ethOhlcv, setEthOhlcv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Data Fetching ───────────────────────────────────────────────────────────
  const selectedCoin = useMemo(
    () => COINS.find((c) => c.symbol === selectedSymbol),
    [selectedSymbol],
  );

  const loadData = useCallback(async () => {
    if (!selectedCoin) return;

    setLoading(true);
    setError(null);

    try {
      // Параллельная загрузка обеих пар
      const [altData, ethData] = await Promise.all([
        fetchOHLCV(selectedCoin.pair, timeframe, 300),
        fetchOHLCV(ETH_PAIR, timeframe, 300),
      ]);

      setAltOhlcv(altData);
      setEthOhlcv(ethData);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCoin, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Computed Data ───────────────────────────────────────────────────────────
  const computed = useMemo(() => {
    if (!altOhlcv || !ethOhlcv || altOhlcv.length === 0 || ethOhlcv.length === 0) {
      return null;
    }

    // 1. Выравнивание по timestamp
    const { timestamps, altCandles, ethCandles } = alignByTimestamp(altOhlcv, ethOhlcv);

    if (timestamps.length < 5) return null;

    const dates = timestamps.map((ts) => new Date(ts));
    const altCloses = altCandles.map((c) => c[4]);
    const ethCloses = ethCandles.map((c) => c[4]);

    // 2. Лог-доходности (цена/USDT)
    const altLogReturns = calculateLogReturns(altCloses);
    const ethLogReturns = calculateLogReturns(ethCloses);
    const returnDates = dates.slice(1); // на одну дату меньше

    // 3. Кросс-курс ALT/ETH
    const crossRate = calculateCrossRate(altCloses, ethCloses);

    // 4. Лог-доходности кросс-курса
    const crossRateLogReturns = calculateLogReturns(crossRate);
    const crossReturnDates = dates.slice(1);

    // 5. Регрессия: y = α + β·x, где x = ETH, y = Alt
    const reg = linearRegression(ethLogReturns, altLogReturns);

    // 6. Статистики
    const periodsPerYear = TIMEFRAMES[timeframe]?.periodsPerYear ?? 365;

    const stats = {
      beta: reg.slope,
      alpha: reg.intercept,
      correlation: reg.correlation,
      rSquared: reg.rSquared,
      tStatistic: reg.tStatistic,
      n: reg.n,
      annReturnCoin: annualizedReturn(altLogReturns, periodsPerYear),
      annVolCoin: annualizedVolatility(altLogReturns, periodsPerYear),
      sharpeCoin: sharpeRatio(altLogReturns, periodsPerYear),
      maxDDCoin: maxDrawdown(altCloses),
      annReturnEth: annualizedReturn(ethLogReturns, periodsPerYear),
      annVolEth: annualizedVolatility(ethLogReturns, periodsPerYear),
      sharpeEth: sharpeRatio(ethLogReturns, periodsPerYear),
    };

    return {
      dates,
      altCandles,
      altLogReturns,
      ethLogReturns,
      returnDates,
      crossRate,
      crossRateLogReturns,
      crossReturnDates,
      regression: reg,
      stats,
    };
  }, [altOhlcv, ethOhlcv, timeframe]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <CoinSelector
        coins={COINS}
        selectedSymbol={selectedSymbol}
        onSelect={setSelectedSymbol}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        timeframes={TIMEFRAMES}
      />

      {/* Main Content */}
      <main className="dashboard__main">
        {/* Header */}
        <header className="dashboard__header">
          <h1 className="dashboard__title">
            <span className="dashboard__logo">◈</span>
            Quant Crypto Analytics
          </h1>
          <p className="dashboard__subtitle">
            {selectedCoin?.name} ({selectedSymbol}/USDT) — Кросс-анализ к ETH
            {' '}
            <span className="dashboard__timeframe-badge">{TIMEFRAMES[timeframe]?.label}</span>
          </p>
        </header>

        {/* Loading / Error */}
        {loading && (
          <div className="dashboard__status dashboard__status--loading">
            <div className="spinner" />
            <span>Загрузка данных с Binance…</span>
          </div>
        )}
        {error && (
          <div className="dashboard__status dashboard__status--error">
            ⚠ Ошибка: {error}
            <button className="retry-btn" onClick={loadData}>
              Повторить
            </button>
          </div>
        )}

        {/* Charts */}
        {computed && !loading && (
          <div className="dashboard__charts">
            {/* Stats Panel */}
            <StatsPanel stats={computed.stats} coinSymbol={selectedSymbol} />

            {/* 1. Свечной график */}
            <CandlestickChart
              ohlcv={computed.altCandles}
              title={`${selectedSymbol}/USDT — Свечной график`}
            />

            {/* 2. Лог-доходности цены */}
            <LogReturnsChart
              returns={computed.altLogReturns}
              dates={computed.returnDates}
              title={`Логарифмические доходности ${selectedSymbol}/USDT`}
              color="#a78bfa"
            />

            {/* 3. Кросс-курс к ETH */}
            <CrossRateChart
              crossRate={computed.crossRate}
              dates={computed.dates}
              title={`Кросс-курс ${selectedSymbol}/ETH`}
              symbol={selectedSymbol}
            />

            {/* 4. Лог-доходности кросс-курса */}
            <CrossRateLogReturnsChart
              returns={computed.crossRateLogReturns}
              dates={computed.crossReturnDates}
              title={`Логарифмические доходности ${selectedSymbol}/ETH`}
              color="#06b6d4"
            />

            {/* 5. Регрессия + Корреляция */}
            <RegressionChart
              ethReturns={computed.ethLogReturns}
              altReturns={computed.altLogReturns}
              regression={computed.regression}
              symbol={selectedSymbol}
            />
          </div>
        )}
      </main>
    </div>
  );
}

