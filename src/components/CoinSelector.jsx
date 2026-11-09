import React from 'react';

/**
 * Боковая панель для выбора альткоина и таймфрейма.
 */
export default function CoinSelector({
  coins,
  selectedSymbol,
  onSelect,
  timeframe,
  onTimeframeChange,
  timeframes,
}) {
  return (
    <aside className="coin-selector">
      <div className="coin-selector__header">
        <h2 className="coin-selector__title">Альткоины</h2>
        <span className="coin-selector__subtitle">Экосистема Ethereum</span>
      </div>

      {/* Таймфрейм */}
      <div className="coin-selector__timeframes">
        {Object.entries(timeframes).map(([key, { label }]) => (
          <button
            key={key}
            className={`tf-btn ${timeframe === key ? 'tf-btn--active' : ''}`}
            onClick={() => onTimeframeChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Список монет */}
      <ul className="coin-selector__list">
        {coins.map((coin) => (
          <li
            key={coin.symbol}
            className={`coin-card ${selectedSymbol === coin.symbol ? 'coin-card--active' : ''}`}
            onClick={() => onSelect(coin.symbol)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(coin.symbol)}
          >
            <div className="coin-card__symbol">{coin.symbol}</div>
            <div className="coin-card__name">{coin.name}</div>
            <div className="coin-card__category">{coin.category}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

