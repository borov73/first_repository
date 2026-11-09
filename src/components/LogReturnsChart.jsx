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
 * Линейный график логарифмических доходностей.
 *
 * @param {{ returns: number[], dates: Date[], title: string, color?: string }} props
 */
export default function LogReturnsChart({ returns, dates, title, color = '#a78bfa' }) {
  const data = useMemo(() => {
    if (!returns || returns.length === 0) return [];
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: dates,
        y: returns,
        line: { color, width: 1.2 },
        fill: 'tozeroy',
        fillcolor: `${color}15`,
        hovertemplate: '%{x|%Y-%m-%d %H:%M}<br>r = %{y:.6f}<extra></extra>',
      },
    ];
  }, [returns, dates, color]);

  const layout = useMemo(
    () => ({
      ...DARK,
      title: { text: title, font: { size: 14, color: '#e6edf3' }, x: 0.01 },
      xaxis: { ...DARK.xaxis, type: 'date' },
      yaxis: { ...DARK.yaxis, title: 'ln(Pₜ / Pₜ₋₁)', zeroline: true, zerolinewidth: 1 },
      shapes: [
        {
          type: 'line',
          x0: dates?.[0],
          x1: dates?.[dates?.length - 1],
          y0: 0,
          y1: 0,
          line: { color: '#484f58', width: 1, dash: 'dot' },
        },
      ],
    }),
    [title, dates],
  );

  if (!returns || returns.length === 0) {
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

