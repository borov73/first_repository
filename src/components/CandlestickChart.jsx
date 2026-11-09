import React, { useMemo } from 'react';
import Plot from './PlotlyChart';

/**
 * Общая конфигурация тёмной темы Plotly.
 */
const DARK = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: '#0d1117',
  font: { color: '#e6edf3', family: 'Inter, system-ui, sans-serif', size: 12 },
  xaxis: {
    gridcolor: '#21262d',
    zerolinecolor: '#30363d',
    linecolor: '#30363d',
    rangeslider: { visible: false },
  },
  yaxis: {
    gridcolor: '#21262d',
    zerolinecolor: '#30363d',
    linecolor: '#30363d',
  },
  margin: { t: 50, r: 30, b: 50, l: 70 },
};

const CONFIG = {
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  responsive: true,
};

/**
 * Свечной график OHLCV.
 *
 * @param {{ ohlcv: number[][], title: string }} props
 */
export default function CandlestickChart({ ohlcv, title }) {
  const data = useMemo(() => {
    if (!ohlcv || ohlcv.length === 0) return [];

    const dates = ohlcv.map((c) => new Date(c[0]));
    const open  = ohlcv.map((c) => c[1]);
    const high  = ohlcv.map((c) => c[2]);
    const low   = ohlcv.map((c) => c[3]);
    const close = ohlcv.map((c) => c[4]);

    return [
      {
        type: 'candlestick',
        x: dates,
        open,
        high,
        low,
        close,
        increasing: { line: { color: '#3fb950', width: 1 }, fillcolor: '#23863680' },
        decreasing: { line: { color: '#f85149', width: 1 }, fillcolor: '#da363480' },
        whiskerwidth: 0.5,
      },
    ];
  }, [ohlcv]);

  const layout = useMemo(
    () => ({
      ...DARK,
      title: { text: title, font: { size: 14, color: '#e6edf3' }, x: 0.01 },
      xaxis: { ...DARK.xaxis, type: 'date' },
      yaxis: { ...DARK.yaxis, title: 'Цена (USDT)' },
    }),
    [title],
  );

  if (!ohlcv || ohlcv.length === 0) {
    return <div className="chart-placeholder">Нет данных</div>;
  }

  return (
    <div className="chart-container">
      <Plot
        data={data}
        layout={layout}
        config={CONFIG}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

