/**
 * Единственный экспорт компонента <Plot /> через фабрику react-plotly.js.
 * Используется plotly.js-dist-min для уменьшения размера бандла.
 */
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);
export default Plot;

