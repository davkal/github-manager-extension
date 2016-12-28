
function buildQuery(query) {
  return Object.keys(query).map(k => `${k}:${query[k]}`).join('+');
}

function getISODate(ts) {
  return (new Date(ts)).toISOString().substr(0, 10);
}

function doDateQuery(query, from, to) {
  const created = `${getISODate(from)}..${getISODate(to)}`;
  const params = Object.assign({ created }, query);
  const q = buildQuery(params);
  const url = `https://api.github.com/search/issues?q=${q}`;

  return new Promise((resolve) => {
    chrome.storage.local.get([url], (items) => {
      if (items[url]) {
        resolve(items[url]);
      } else {
        fetch(url)
          .then(res => res.json())
          .then((json) => {
            const { total_count } = json;
            // cache total count for this url
            chrome.storage.local.set({ [url]: total_count });
            resolve(total_count);
          });
      }
    });
  });
}

export function getIssuesPerWeek(from, to) {
  // get repo
  const pathNameParts = location.pathname.split('/');
  const user = pathNameParts[1];
  const repository = pathNameParts[2];
  const repo = `${user}/${repository}`;

  // search options
  const label = 'bug';
  const states = ['open', 'closed'];
  const issues = { from, to, fromIso: getISODate(from), toIso: getISODate(to) };

  return states.reduce((sequence, state) => {
    const query = { repo, label, state };
    return sequence
      .then(() => doDateQuery(query, from, to))
      .then((count) => {
        issues[state] = count;
        return issues;
      });
  }, Promise.resolve());
}

export default getIssuesPerWeek;
