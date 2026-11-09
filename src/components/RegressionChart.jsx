import React, { useMemo } from 'react';
import Plot from './PlotlyChart';

const DARK = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: '#0d1117',
  font: { color: '#e6edf3', family: 'Inter, system-ui, sans-serif', size: 12 },
  xaxis: { gridcolor: '#21262d', zerolinecolor: '#30363d', linecolor: '#30363d' },
  yaxis: { gridcolor: '#21262d', zerolinecolor: '#30363d', linecolor: '#30363d' },
  margin: { t: 60, r: 30, b: 60, l: 70 },
};

const CONFIG = {
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  responsive: true,
};

/**
 * Scatter-plot лог-доходностей ETH (x) vs Altcoin (y)
 * с линией OLS-регрессии и аннотациями (β, ρ, R²).
 *
 * @param {{
 *   ethReturns: number[],
 *   altReturns: number[],
 *   regression: object,
 *   symbol: string,
 * }} props
 */
export default function RegressionChart({ ethReturns, altReturns, regression, symbol }) {
  const { data, layout } = useMemo(() => {
    if (
      !ethReturns || ethReturns.length === 0 ||
      !altReturns || altReturns.length === 0 ||
      !regression
    ) {
      return { data: [], layout: DARK };
    }

    const { slope, intercept, rSquared, correlation, tStatistic } = regression;

    // Линия регрессии — от минимального до максимального x
    const xMin = Math.min(...ethReturns);
    const xMax = Math.max(...ethReturns);
    const regX = [xMin, xMax];
    const regY = regX.map((x) => slope * x + intercept);

    const scatterTrace = {
      type: 'scatter',
      mode: 'markers',
      x: ethReturns,
      y: altReturns,
      marker: {
        color: '#58a6ff',
        size: 4,
        opacity: 0.6,
        line: { width: 0 },
      },
      name: 'Наблюдения',
      hovertemplate:
        'ETH r = %{x:.6f}<br>' + symbol + ' r = %{y:.6f}<extra></extra>',
    };

    const regressionTrace = {
      type: 'scatter',
      mode: 'lines',
      x: regX,
      y: regY,
      line: { color: '#f85149', width: 2.5 },
      name: `OLS: y = ${slope.toFixed(4)}·x + ${intercept.toFixed(6)}`,
    };

    const chartLayout = {
      ...DARK,
      title: {
        text: `Регрессия логарифмических доходностей: ${symbol} vs ETH`,
        font: { size: 14, color: '#e6edf3' },
        x: 0.01,
      },
      xaxis: {
        ...DARK.xaxis,
        title: 'Лог-доходность ETH',
      },
      yaxis: {
        ...DARK.yaxis,
        title: `Лог-доходность ${symbol}`,
      },
      showlegend: true,
      legend: {
        x: 0.01,
        y: 0.99,
        bgcolor: 'rgba(13,17,23,0.8)',
        bordercolor: '#30363d',
        borderwidth: 1,
        font: { size: 11 },
      },
      annotations: [
        {
          x: 0.99,
          y: 0.02,
          xref: 'paper',
          yref: 'paper',
          text: [
            `<b>β = ${slope.toFixed(4)}</b>`,
            `α = ${intercept.toFixed(6)}`,
            `ρ = ${correlation.toFixed(4)}`,
            `R² = ${rSquared.toFixed(4)}`,
            `t = ${tStatistic.toFixed(2)}`,
            `n = ${ethReturns.length}`,
          ].join('<br>'),
          showarrow: false,
          font: { family: 'JetBrains Mono, monospace', size: 12, color: '#e6edf3' },
          align: 'right',
          bgcolor: 'rgba(13,17,23,0.85)',
          bordercolor: '#30363d',
          borderwidth: 1,
          borderpad: 8,
        },
      ],
    };

    return { data: [scatterTrace, regressionTrace], layout: chartLayout };
  }, [ethReturns, altReturns, regression, symbol]);

  if (!ethReturns || ethReturns.length === 0) {
    return <div className="chart-placeholder">Нет данных для регрессии</div>;
  }

  return (
    <div className="chart-container chart-container--tall">
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

