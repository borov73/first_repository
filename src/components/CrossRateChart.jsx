import React, { useMemo } from 'react';
import Plot from './PlotlyChart';

const DARK = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: '#0d1117',
  font: { color: '#e6edf3', family: 'Inter, system-ui, sans-serif', size: 12 },
  xaxis: { gridcolor: '#21262d', zerolinecolor: '#30363d', linecolor: '#30363d' },
  yaxis: { gridcolor: '#21262d', zerolinecolor: '#30363d', linecolor: '#30363d' },
  margin: { t: 50, r: 30, b: 50, l: 70 },
};

const CONFIG = {
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  responsive: true,
};

/**
 * График кросс-курса альткоина к ETH.
 *
 * @param {{ crossRate: number[], dates: Date[], title: string, symbol: string }} props
 */
export default function CrossRateChart({ crossRate, dates, title, symbol }) {
  const data = useMemo(() => {
    if (!crossRate || crossRate.length === 0) return [];
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: dates,
        y: crossRate,
        line: { color: '#f59e0b', width: 1.5 },
        fill: 'tozeroy',
        fillcolor: '#f59e0b10',
        hovertemplate: `%{x|%Y-%m-%d %H:%M}<br>${symbol}/ETH = %{y:.8f}<extra></extra>`,
      },
    ];
  }, [crossRate, dates, symbol]);

  const layout = useMemo(
    () => ({
      ...DARK,
      title: { text: title, font: { size: 14, color: '#e6edf3' }, x: 0.01 },
      xaxis: { ...DARK.xaxis, type: 'date' },
      yaxis: { ...DARK.yaxis, title: `${symbol} / ETH` },
    }),
    [title, symbol],
  );

  if (!crossRate || crossRate.length === 0) {
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

