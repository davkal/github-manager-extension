import { getIssuesPerWeek } from './api';
import { renderAnalysis } from './components/analysis';

const WEEK = 7 * 24 * 60 * 60 * 1000; // in ms
const WEEKS = [6, 7, 2, 3, 4, 5]; // last 6 weeks

const getIssuesSection = () => document.querySelector('.issues-listing');

function injectAnalysis(vector) {
  // find menu element to place analysis
  const subNav = document.querySelector('.issues-listing .subnav');
  if (subNav && getIssuesSection()) {
    const container = document.createElement('div');
    subNav.append(container);
    renderAnalysis(container, vector.reverse());
  }
}

function startAnalysis() {
  const today = new Date();
  let accumulator = [];

  return WEEKS.reduce((sequence, i) => {
    const to = today - (i * WEEK);
    const from = to - WEEK;
    return sequence
      .then(() => getIssuesPerWeek(from, to))
      .then((issues) => {
        accumulator = [...accumulator, issues];
        return accumulator;
      });
  }, Promise.resolve())
    .then(injectAnalysis);
}

/**
 * Start a DOM mutation observer that looks for elements appearing
 */
function startDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    const foundNewContainer = mutations.find(mutation =>
      Array.prototype.find.call(mutation.addedNodes, (node) => {
        if (node.nodeType === node.ELEMENT_NODE) {
          return node.classList.contains('container');
        }
        return false;
      })
    );
    if (foundNewContainer && getIssuesSection()) {
      startAnalysis();
    }
  });

  observer.observe(document, {
    subtree: true,
    childList: true
  });
}

// check if already on issues page
if (getIssuesSection()) {
  startAnalysis();
}

// keep looking for issues page in SPA
startDOMObserver();
