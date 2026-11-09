import React from 'react';

/**
 * Панель ключевых статистик по выбранному активу.
 */
export default function StatsPanel({ stats, coinSymbol }) {
  if (!stats) return null;

  const fmt = (v, d = 4) =>
    typeof v === 'number' && isFinite(v) ? v.toFixed(d) : '—';
  const pct = (v, d = 2) =>
    typeof v === 'number' && isFinite(v) ? `${(v * 100).toFixed(d)}%` : '—';

  const rows = [
    { label: 'β (Beta к ETH)',        value: fmt(stats.beta, 4) },
    { label: 'α (Alpha)',             value: fmt(stats.alpha, 6) },
    { label: 'ρ (Корреляция)',        value: fmt(stats.correlation, 4) },
    { label: 'R²',                    value: fmt(stats.rSquared, 4) },
    { label: 't-stat (slope)',        value: fmt(stats.tStatistic, 2) },
    { label: 'Ann. Return (coin)',    value: pct(stats.annReturnCoin) },
    { label: 'Ann. Vol (coin)',       value: pct(stats.annVolCoin) },
    { label: 'Sharpe (coin)',         value: fmt(stats.sharpeCoin, 3) },
    { label: 'Max DD (coin)',         value: pct(stats.maxDDCoin) },
    { label: 'Ann. Return (ETH)',     value: pct(stats.annReturnEth) },
    { label: 'Ann. Vol (ETH)',        value: pct(stats.annVolEth) },
    { label: 'Sharpe (ETH)',          value: fmt(stats.sharpeEth, 3) },
    { label: 'Observations (n)',      value: stats.n },
  ];

  return (
    <div className="stats-panel">
      <h3 className="stats-panel__title">
        Статистика — {coinSymbol} / ETH
      </h3>
      <table className="stats-panel__table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="stats-panel__label">{row.label}</td>
              <td className="stats-panel__value">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

