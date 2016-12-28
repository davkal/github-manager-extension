import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import React from 'react';
import ReactDOM from 'react-dom';

export function renderAnalysis(container, issues) {
  ReactDOM.render(<Analysis readOnly issues={issues} />, container);
}

const WIDTH = 120;
const HEIGHT = 32;

const STYLES = {
  container: {
    paddingLeft: 10,
    display: 'flex',
  },
  graph: {
    padding: 1,
  },
  bigNumber: {
    color: 'rgb(102, 102, 102)',
    fontSize: 18,
  },
  numberLabel: {
    paddingLeft: 4,
    color: 'rgb(118, 118, 118)',
    fontSize: 11,
  },
  numbers: {
    lineHeight: '32px',
    paddingLeft: 5,
  }
};

const WeekBars = ({ fromIso, open = 0, closed = 0, i, n, x, y }) => (
  <g>
    <title>{i === n - 1 ? 'Last week' : `${n - i} weeks ago`}: {open} opened vs. {closed} closed</title>
    <line x1={x(fromIso)} x2={x(fromIso) + x.bandwidth()} y1={HEIGHT / 2} y2={HEIGHT / 2} strokeWidth="1" stroke="rgb(229, 229, 229)" />
    <rect
      fillOpacity={1 - ((n - (i + 1)) / 10)} fill="rgb(252, 41, 41)"
      x={x(fromIso)} y={y(open)} width={x.bandwidth()} height={(HEIGHT / 2) - y(open)} />
    <rect
      fillOpacity={1 - ((n - (i + 1)) / 10)} fill="rgb(64, 120, 192)"
      x={x(fromIso)} y={HEIGHT / 2} width={x.bandwidth()} height={(HEIGHT / 2) - y(closed)} />
  </g>
);

export default class Analysis extends React.Component {
  render() {
    const { issues } = this.props;
    if (issues.length === 0) {
      return 'n/a';
    }

    const x = scaleBand().range([0, WIDTH]).padding(0.1);
    const y = scaleLinear().range([HEIGHT / 2, 0]);
    x.domain(issues.map(d => d.fromIso));
    y.domain([0, max(issues, d => Math.max(d.open, d.closed, 0))]);

    const sumOpened = issues.reduce((sum, issue) => sum + (issue.open || 0), 0);
    const sumClosed = issues.reduce((sum, issue) => sum + (issue.closed || 0), 0);
    const avgBmi = sumOpened ? Math.round((sumClosed / sumOpened) * 100) : 'n/a';
    const n = issues.length;
    const startIso = issues[0].fromIso;
    const endIso = issues[issues.length - 1].toIso;
    const numbersTitle = `BMI over the last ${n} weeks (${startIso} - ${endIso}).
BMI (backlog management index) is the number of issues closed during the period
 divided by the number of opened issues during the same period. Only issues labeled "bug" are counted.
A BMI larger than 100 means the backlog was being reduced during the period.`;

    return (
      <div style={STYLES.container}>
        <div style={STYLES.graph}>
          <svg width={WIDTH} height={HEIGHT}>
            <g>
              {issues.map((issue, i) => <WeekBars
                key={issue.from} i={i} x={x} y={y} n={n} {...issue} />)}
            </g>
          </svg>
        </div>
        <div style={STYLES.numbers} title={numbersTitle}>
          <span style={STYLES.bigNumber}>{avgBmi}</span>
          <span style={STYLES.numberLabel}>BMI</span>
        </div>
      </div>
    );
  }

}
